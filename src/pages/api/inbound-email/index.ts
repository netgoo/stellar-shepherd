// ============================================================
// Inbound Email Webhook v4.1.2
// Fixes:
//   BUG1: Split messageId and inReplyToHeader (was merged, caused
//         threadId to use message-id -> debounce never merged).
//   BUG2: Restore pessimistic idempotency lock (mark immediately
//         after check, delete on enqueue failure). Prevents Resend
//         retry during enqueue from causing duplicate queue entries.
//   v4.1.2: Extract display name from From header (Resend's data.from
//           is often bare email; headers.from has "Name <email>").
//           Sync unsubscribe sign-off to new format.
// v4.1 base: KV debounce merge, OOO pre-filter, unsubscribe detect,
//             human keyword forwarding, thread ID + latest tracking.
// ============================================================
export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { processInboundEmail, fastPathClassify, generateThreadId } from '../../../lib/reply-engine';
import {
  BLACKLIST_KEY_PREFIX,
  RATE_LIMIT_MAX_REPLIES,
  RATE_LIMIT_KEY_PREFIX,
  FORWARD_EMAILS,
  FORWARD_SUBJECT_PREFIX,
  HUMAN_INTERVENTION_KEYWORDS,
  SENDER,
  DEBOUNCE,
} from '../../../config/reply-config';
import {
  enqueueReply,
  calculateHumanDelay,
  cancelQstashMessage,
  type QueuedReply,
} from '../../../lib/qstash-client';
const IDEMPOTENCY_TTL_SECONDS = 86400;
// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function getResend(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('[inbound-email] RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey.trim());
}
function extractEmail(fromField: string): string {
  const match = fromField.match(/<([^>]+)>/);
  return match ? match[1].trim().toLowerCase() : fromField.trim().toLowerCase();
}
function extractEmailsFromTo(toField: any): string[] {
  if (!toField) return [];
  if (Array.isArray(toField)) {
    return toField.map((t: any) => extractEmail(typeof t === 'string' ? t : t?.email || ''));
  }
  return [extractEmail(typeof toField === 'string' ? toField : toField?.email || '')];
}
async function addToBlacklist(email: string, reason: string): Promise<void> {
  try {
    const key = `${BLACKLIST_KEY_PREFIX}${email}`;
    await kvStore.set(key, { reason, addedAt: Date.now() });
    console.log(`[inbound-email] Blacklisted: ${email} (reason: ${reason})`);
  } catch (err) {
    console.warn('[inbound-email] Failed to add to blacklist:', err);
  }
}
async function getRateLimitCount(email: string): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `${RATE_LIMIT_KEY_PREFIX}${email}:${today}`;
    const count = await kvStore.get(key);
    return typeof count === 'number' ? count : 0;
  } catch {
    return 0;
  }
}
function matchesHumanIntervention(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  return HUMAN_INTERVENTION_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}
async function forwardToHuman(
  resend: Resend,
  senderField: string,
  senderEmail: string,
  subject: string,
  body: string,
  reason: string,
): Promise<void> {
  await resend.emails.send({
    from: 'Alex (Inbound System) <alex@wenboom.com>',
    to: FORWARD_EMAILS,
    subject: `${FORWARD_SUBJECT_PREFIX} [${reason}] ${subject}`,
    replyTo: senderEmail,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
          <strong>Forward Reason:</strong> ${reason}<br/>
          <strong>Original Sender:</strong> ${senderField}
        </div>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
        <p><strong>Email Content:</strong></p>
        <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6;">${body.substring(0, 5000)}</pre>
      </div>
    `,
  });
}
async function sendUnsubscribeConfirmation(resend: Resend, toEmail: string): Promise<void> {
  try {
    await resend.emails.send({
      from: SENDER.from,
      to: toEmail,
      subject: 'Unsubscribe confirmed',
      text: `You have been unsubscribed from automated replies. You will no longer receive automated responses from this address.
If this was a mistake, reply to this email and we'll reconnect you manually.
Alex
Principal AI Infrastructure Architect @ Wenboom.com`,
    });
    console.log(`[inbound-email] Unsubscribe confirmation sent to: ${toEmail}`);
  } catch (err) {
    console.warn('[inbound-email] Failed to send unsubscribe confirmation:', err);
  }
}
// ------------------------------------------------------------
// Main Webhook Handler
// ------------------------------------------------------------
export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    console.warn('[inbound-email] Invalid JSON body received');
    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid JSON body' }),
      { status: 400 }
    );
  }
  try {
    const eventType = body?.type;
    const emailData = body.data || {};
    // Step 2: bounce / complaint
    if (eventType === 'email.bounced' || eventType === 'email.complained') {
      const recipients = extractEmailsFromTo(emailData.to);
      for (const email of recipients) {
        if (email) {
          await addToBlacklist(email, eventType === 'email.bounced' ? 'bounce' : 'complaint');
        }
      }
      return new Response(
        JSON.stringify({ status: 'blacklisted', event: eventType, count: recipients.length }),
        { status: 200 }
      );
    }
    if (eventType !== 'email.received') {
      return new Response(
        JSON.stringify({ status: 'ignored', type: eventType }),
        { status: 200 }
      );
    }
    let rawFrom = String(emailData.from || '');
    const senderEmail = extractEmail(rawFrom);
    const subject = emailData.subject || 'No Subject';
    const bodyText = emailData.text ||
      (emailData.html ? emailData.html.replace(/<[^>]*>?/gm, '') : '') || '';
    // Step 4b: Extract headers — FIX BUG1: split messageId and inReplyToHeader
    const headers: Record<string, string> = {};
    if (emailData.headers && typeof emailData.headers === 'object') {
      for (const [k, v] of Object.entries(emailData.headers)) {
        headers[k.toLowerCase()] = String(v);
      }
    }
    // v4.1.2: Override rawFrom with From header if it contains a display name
    // (Resend's data.from is often just the bare email; headers.from has "Name <email>")
    if (headers['from'] && headers['from'].includes('<') && headers['from'].includes('>')) {
      rawFrom = headers['from'];
      console.log(`[inbound-email] Using From header display name: ${rawFrom}`);
    }
    const messageId = headers['message-id'] || null;              // current email ID -> for In-Reply-To header when sending reply
    const inReplyToHeader = headers['in-reply-to'] || null;       // target email ID -> for thread ID generation
    const references = headers['references'] || null;
    const autoSubmitted = headers['auto-submitted'] || '';
    const xAutoreply = headers['x-autoreply'] || '';
    // Step 4: Ignore self-replies
    if (senderEmail === 'alex@wenboom.com') {
      console.log('[inbound-email] Ignored self-reply');
      return new Response(
        JSON.stringify({ status: 'ignored_self_reply' }),
        { status: 200 }
      );
    }
    // Step 5: OOO / auto-reply pre-filter
    const fastIntent = fastPathClassify(bodyText, {
      'auto-submitted': autoSubmitted,
      'x-autoreply': xAutoreply,
    });
    if (fastIntent === 'TYPE_D_AUTO_REPLY') {
      console.log(`[inbound-email] Auto-reply/OOO detected, silent drop: ${senderEmail}`);
      return new Response(
        JSON.stringify({ status: 'ignored_auto_reply' }),
        { status: 200 }
      );
    }
    // Step 6: Unsubscribe detection
    if (fastIntent === 'TYPE_E_UNSUBSCRIBE') {
      console.log(`[inbound-email] Unsubscribe request from: ${senderEmail}`);
      await addToBlacklist(senderEmail, 'unsubscribe');
      const resend = getResend();
      await sendUnsubscribeConfirmation(resend, senderEmail);
      return new Response(
        JSON.stringify({ status: 'unsubscribed', sender: senderEmail }),
        { status: 200 }
      );
    }
    // Step 7: Idempotency check — FIX BUG2: pessimistic lock (mark immediately)
    const emailId = emailData.email_id || emailData.id;
    if (emailId) {
      const idempotencyKey = `processed_email:${emailId}`;
      const alreadyProcessed = await kvStore.get(idempotencyKey);
      if (alreadyProcessed) {
        console.log('[inbound-email] Duplicate webhook, ignoring:', emailId);
        return new Response(
          JSON.stringify({ status: 'already_processed' }),
          { status: 200 }
        );
      }
      // Mark immediately (pessimistic lock) to prevent Resend retry during enqueue
      await kvStore.set(idempotencyKey, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
    }
    // Step 8: Blacklist check
    try {
      const blacklistKey = `${BLACKLIST_KEY_PREFIX}${senderEmail}`;
      const isBlocked = await kvStore.get(blacklistKey);
      if (isBlocked) {
        console.log(`[inbound-email] Skipped: blacklisted sender ${senderEmail}`);
        return new Response(
          JSON.stringify({ status: 'skipped', reason: 'blacklisted' }),
          { status: 200 }
        );
      }
    } catch {
      // allow through
    }
    // Step 9: Rate limit pre-check
    const replyCount = await getRateLimitCount(senderEmail);
    if (replyCount >= RATE_LIMIT_MAX_REPLIES) {
      console.log(`[inbound-email] Rate limit pre-check: ${replyCount}/${RATE_LIMIT_MAX_REPLIES}, forwarding: ${senderEmail}`);
      const resend = getResend();
      await forwardToHuman(resend, rawFrom, senderEmail, subject, bodyText, 'rate_limited');
      return new Response(
        JSON.stringify({ status: 'forwarded', reason: 'rate-limited', sender: senderEmail }),
        { status: 200 }
      );
    }
    // Step 10: Human intervention keyword check
    if (matchesHumanIntervention(subject, bodyText)) {
      console.log(`[inbound-email] Human intervention keyword matched, forwarding: ${senderEmail}`);
      const resend = getResend();
      await forwardToHuman(resend, rawFrom, senderEmail, subject, bodyText, 'human_keyword');
      return new Response(
        JSON.stringify({ status: 'forwarded', reason: 'human_keyword', sender: senderEmail }),
        { status: 200 }
      );
    }
    // Step 11: Generate Thread ID (uses inReplyToHeader, NOT messageId)
    const threadId = generateThreadId(senderEmail, subject, inReplyToHeader, references);
    // Step 12: KV debounce merge
    const bufferKey = `buffer:${threadId}`;
    const latestKey = `latest:${threadId}`;
    const now = Date.now();
    let existingBuffer: { jobId: string; firstMessageAt: number; messages: string[] } | null = null;
    try {
      existingBuffer = await kvStore.get(bufferKey) as any;
    } catch {
      existingBuffer = null;
    }
    const firstMessageAt = existingBuffer?.firstMessageAt || now;
    const isWithinHardCap = (now - firstMessageAt) < DEBOUNCE.maxBufferWaitMinutes * 60 * 1000;
    let combinedBody = bodyText;
    if (existingBuffer && isWithinHardCap && existingBuffer.jobId) {
      await cancelQstashMessage(existingBuffer.jobId);
      const prevMessages = existingBuffer.messages.join('\n\n--- [Follow-up email] ---\n\n');
      combinedBody = `${prevMessages}\n\n--- [Follow-up email] ---\n\n${bodyText}`;
      if (combinedBody.length > DEBOUNCE.maxCombinedBodyLength) {
        combinedBody = combinedBody.slice(-DEBOUNCE.maxCombinedBodyLength);
      }
      console.log(`[inbound-email] Debounce merge: cancelled job ${existingBuffer.jobId}, merged ${existingBuffer.messages.length + 1} emails`);
    }
    const allMessages = existingBuffer && isWithinHardCap
      ? [...existingBuffer.messages, bodyText]
      : [bodyText];
    // Step 13: Calculate delay & enqueue
    const receivedAt = now;
    const delaySeconds = calculateHumanDelay(receivedAt);
    const queued: QueuedReply = {
      emailId: emailId || `${senderEmail}-${subject}-${bodyText.substring(0, 100)}`,
      senderEmail,
      senderField: rawFrom,
      subject,
      body: bodyText,
      receivedAt,
      threadId,
      inReplyTo: messageId || undefined,  // FIX BUG1: use messageId (current email ID)
      combinedBody,
      firstMessageAt,
    };
    try {
      const messageIdQstash = await enqueueReply(queued, delaySeconds);
      // Idempotency already marked in Step 7 (pessimistic lock)
      // No need to set again here.
      await kvStore.set(bufferKey, {
        jobId: messageIdQstash,
        firstMessageAt,
        messages: allMessages,
      }, { ex: DEBOUNCE.bufferTtlSeconds });
      await kvStore.set(latestKey, messageIdQstash, { ex: DEBOUNCE.bufferTtlSeconds });
      console.log(
        `[inbound-email] Enqueued: ${messageIdQstash}, delay: ${delaySeconds}s (${Math.round(delaySeconds / 60)}min), ` +
        `thread: ${threadId}, from: ${senderEmail}, merged: ${allMessages.length}`
      );
      return new Response(
        JSON.stringify({
          status: 'queued',
          messageId: messageIdQstash,
          delaySeconds,
          threadId,
          mergedCount: allMessages.length,
          sender: senderEmail,
        }),
        { status: 200 }
      );
    } catch (qstashErr: any) {
      // FIX BUG2: delete pessimistic idempotency mark on enqueue failure
      console.error('[inbound-email] QStash enqueue failed, falling back to sync:', qstashErr?.message || qstashErr);
      if (emailId) {
        try { await kvStore.del(`processed_email:${emailId}`); } catch { /* ignore */ }
      }
      try {
        const result = await processInboundEmail(body);
        console.log('[inbound-email] Sync fallback result:', result.status, result.reason || '');
        return new Response(
          JSON.stringify({ status: 'success_fallback', result }),
          { status: 200 }
        );
      } catch (syncErr: any) {
        console.error('[inbound-email] Sync fallback also failed:', syncErr?.message || syncErr);
        return new Response(
          JSON.stringify({ status: 'error', message: 'Both queue and sync processing failed' }),
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('[inbound-email] Processing error:', error?.message || error);
    return new Response(
      JSON.stringify({ status: 'error', message: error?.message || 'Unknown error' }),
      { status: 500 }
    );
  }
};
