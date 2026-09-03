// ============================================================
// Inbound Email Webhook (v3.0 - Async QStash Queue Architecture)
// Receives Resend webhooks, validates, then enqueues to QStash
// for delayed human-like reply processing. Returns 200 in ~100ms.
// ============================================================
export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { processInboundEmail } from '../../../lib/reply-engine';
import {
  BLACKLIST_KEY_PREFIX,
  RATE_LIMIT_MAX_REPLIES,
  RATE_LIMIT_KEY_PREFIX,
  FORWARD_EMAILS,
} from '../../../config/reply-config';
import { enqueueReply, calculateHumanDelay, type QueuedReply } from '../../../lib/qstash-client';

// Idempotency TTL: 24 hours (same email replayed within 24h is ignored)
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

async function forwardRateLimitExceeded(
  resend: Resend,
  senderField: string,
  senderEmail: string,
  subject: string,
  body: string,
  count: number
): Promise<void> {
  await resend.emails.send({
    from: 'Alex (Inbound System) <alex@wenboom.com>',
    to: FORWARD_EMAILS,
    subject: `[RATE LIMIT EXCEEDED] ${subject}`,
    replyTo: senderEmail,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
          <strong>RATE LIMIT:</strong> This sender has exceeded the 24h AI reply limit (${count}/${RATE_LIMIT_MAX_REPLIES}). Not queued — please review and reply manually.
        </div>
        <p><strong>Original Sender:</strong> ${senderField}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
        <p><strong>Email Content:</strong></p>
        <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6;">${body.substring(0, 5000)}</pre>
      </div>
    `,
  });
}

// ------------------------------------------------------------
// Main Webhook Handler
// ------------------------------------------------------------
export const POST: APIRoute = async ({ request }) => {
  // ------------------------------------------------------------
  // Step 1: Safe JSON parse (malformed payload -> 400, not 500)
  // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // Step 2: Handle bounce / complaint events (write blacklist)
    //   These events have recipient in data.to, not data.from
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // Step 3: Only process email.received events from here on
    // ------------------------------------------------------------
    if (eventType !== 'email.received') {
      return new Response(
        JSON.stringify({ status: 'ignored', type: eventType }),
        { status: 200 }
      );
    }

    const rawFrom = String(emailData.from || '');
    const senderEmail = extractEmail(rawFrom);
    const subject = emailData.subject || 'No Subject';
    const bodyText = emailData.text ||
      (emailData.html ? emailData.html.replace(/<[^>]*>?/gm, '') : '') || '';

    // ------------------------------------------------------------
    // Step 4: Ignore self-replies (exact match, not includes)
    // ------------------------------------------------------------
    if (senderEmail === 'alex@wenboom.com') {
      console.log('[inbound-email] Ignored self-reply');
      return new Response(
        JSON.stringify({ status: 'ignored_self_reply' }),
        { status: 200 }
      );
    }

    // ------------------------------------------------------------
    // Step 5: Idempotency check (prevents duplicate queue entries)
    // ------------------------------------------------------------
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
      // Mark BEFORE enqueue (crash-safe); if enqueue fails we delete it
      await kvStore.set(idempotencyKey, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
    }

    // ------------------------------------------------------------
    // Step 6: Blacklist check (blocked senders don't consume queue)
    // ------------------------------------------------------------
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
      // KV failure -> allow through (reply-engine has secondary blacklist check)
    }

    // ------------------------------------------------------------
    // Step 7: Rate limit pre-check (over-limit -> forward human immediately, no queue)
    //   Prevents queue flooding from users who spam replies.
    // ------------------------------------------------------------
    const replyCount = await getRateLimitCount(senderEmail);
    if (replyCount >= RATE_LIMIT_MAX_REPLIES) {
      console.log(`[inbound-email] Rate limit pre-check: ${replyCount}/${RATE_LIMIT_MAX_REPLIES}, forwarding immediately: ${senderEmail}`);
      const resend = getResend();
      await forwardRateLimitExceeded(resend, rawFrom, senderEmail, subject, bodyText, replyCount);
      return new Response(
        JSON.stringify({ status: 'forwarded', reason: 'rate-limited', sender: senderEmail }),
        { status: 200 }
      );
    }

    // ------------------------------------------------------------
    // Step 8: Calculate human-like delay & enqueue to QStash
    //   Normal path: ~100ms total, returns 200 immediately.
    //   QStash calls /api/worker/process-reply after delay.
    // ------------------------------------------------------------
    const receivedAt = Date.now();
    const delaySeconds = calculateHumanDelay(receivedAt);

    const queued: QueuedReply = {
      emailId: emailId || `${senderEmail}-${subject}-${bodyText.substring(0, 100)}`,
      senderEmail,
      senderField: rawFrom,
      subject,
      body: bodyText,
      receivedAt,
    };

    try {
      const messageId = await enqueueReply(queued, delaySeconds);
      console.log(`[inbound-email] Enqueued to QStash: ${messageId}, delay: ${delaySeconds}s (${Math.round(delaySeconds / 60)}min), from: ${senderEmail}`);
      return new Response(
        JSON.stringify({ status: 'queued', messageId, delaySeconds, sender: senderEmail }),
        { status: 200 }
      );
    } catch (qstashErr: any) {
      // ------------------------------------------------------------
      // Fallback: QStash unavailable -> delete idempotency mark,
      // then process synchronously (no delay, but email not lost)
      // ------------------------------------------------------------
      console.error('[inbound-email] QStash enqueue failed, falling back to sync processing:', qstashErr?.message || qstashErr);
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
