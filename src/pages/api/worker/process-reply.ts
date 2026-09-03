// ============================================================
// QStash Worker Callback v4.1.1
// Fixes:
//   BUG1: ACK counter increment moved to AFTER successful send.
//         Previously incremented before send; if send failed,
//         QStash retry would see count>=limit and silently drop,
//         leaving user with zero reply.
//   BUG2: Rate limit increment moved to AFTER successful send.
//         Previously incremented before send; if send failed on
//         the 3rd email, retry would see count>=3 and forward
//         to human instead of retrying the AI reply.
// v4.1 base: JWS verify -> idempotency -> latest guard ->
//             human lock -> blacklist -> intent classify ->
//             ACK throttle -> rate limit -> AI generate ->
//             link validate -> Resend send -> history update.
// ============================================================
export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { verifyQstashWebhook, type QueuedReply } from '../../../lib/qstash-client';
import {
  fastPathClassify,
  classifyEmailWithLLM,
  matchAffiliateLinks,
  generateReplyContent,
  extractFirstName,
  type EmailIntent,
} from '../../../lib/reply-engine';
import {
  BLACKLIST_KEY_PREFIX,
  RATE_LIMIT_MAX_REPLIES,
  RATE_LIMIT_KEY_PREFIX,
  FORWARD_EMAILS,
  FORWARD_SUBJECT_PREFIX,
  SENDER,
  CLASSIFICATION,
  DEBOUNCE,
  HUMAN_LOCK,
  FALLBACK_REPLY_TEMPLATE,
} from '../../../config/reply-config';

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function getResend(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('[worker] RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey.trim());
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

async function incrementRateLimit(email: string): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `${RATE_LIMIT_KEY_PREFIX}${email}:${today}`;
    const current = await getRateLimitCount(email);
    const next = current + 1;
    await kvStore.set(key, next, { ex: 86400 });
    return next;
  } catch {
    return 1;
  }
}

async function addToBlacklist(email: string, reason: string): Promise<void> {
  try {
    await kvStore.set(`${BLACKLIST_KEY_PREFIX}${email}`, { reason, addedAt: Date.now() });
    console.log(`[worker] Blacklisted: ${email} (reason: ${reason})`);
  } catch (err) {
    console.warn('[worker] Failed to add to blacklist:', err);
  }
}

async function setHumanLock(threadId: string, senderEmail: string, reason: string): Promise<void> {
  try {
    const lockData = { reason, lockedAt: Date.now() };
    await kvStore.set(`${HUMAN_LOCK.keyPrefix}${threadId}`, lockData, { ex: HUMAN_LOCK.ttlSeconds });
    await kvStore.set(`${HUMAN_LOCK.keyPrefix}${senderEmail}`, lockData, { ex: HUMAN_LOCK.ttlSeconds });
    console.log(`[worker] Human lock set: thread=${threadId}, sender=${senderEmail}, reason=${reason}`);
  } catch (err) {
    console.warn('[worker] Failed to set human lock:', err);
  }
}

async function isHumanLocked(threadId: string, senderEmail: string): Promise<boolean> {
  try {
    const byThread = await kvStore.get(`${HUMAN_LOCK.keyPrefix}${threadId}`);
    if (byThread) return true;
    const bySender = await kvStore.get(`${HUMAN_LOCK.keyPrefix}${senderEmail}`);
    return !!bySender;
  } catch {
    return false;
  }
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

Best,
Alex
Principal AI Infrastructure Architect @ Wenboom`,
    });
  } catch (err) {
    console.warn('[worker] Failed to send unsubscribe confirmation:', err);
  }
}

// ------------------------------------------------------------
// Main Worker Handler
// ------------------------------------------------------------
export const POST: APIRoute = async ({ request }) => {
  // Step 1: Read raw body for JWS verification
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    console.warn('[worker] Failed to read request body');
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 });
  }

  // Step 2: JWS signature verification
  const signature = request.headers.get('upstash-signature') || '';
  const isValid = await verifyQstashWebhook(signature, rawBody);
  if (!isValid) {
    console.warn('[worker] Invalid QStash signature, rejecting');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 });
  }

  // Step 3: Parse payload
  let payload: QueuedReply;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.warn('[worker] Failed to parse JSON payload');
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const {
    emailId,
    senderEmail,
    senderField,
    subject,
    body,
    receivedAt,
    threadId,
    inReplyTo,
    combinedBody,
  } = payload;

  // Step 4: Get QStash message ID from header (for idempotency)
  const qstashMessageId =
    request.headers.get('upstash-message-id') ||
    request.headers.get('x-upstash-message-id') ||
    payload.qstashMessageId ||
    `${threadId || senderEmail}-${receivedAt || Date.now()}`;

  console.log(`[worker] Processing: msg=${qstashMessageId}, from=${senderEmail}, thread=${threadId || 'none'}`);

  // Step 5: Idempotency check
  const idempotencyKey = `processed_qstash:${qstashMessageId}`;
  try {
    const alreadyProcessed = await kvStore.get(idempotencyKey);
    if (alreadyProcessed) {
      console.log(`[worker] Duplicate message, skipping: ${qstashMessageId}`);
      return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
    }
  } catch {
    // allow through on KV failure
  }

  // Step 6: Latest message guard (stale job from debounce merge)
  if (threadId) {
    try {
      const latestMsgId = await kvStore.get(`latest:${threadId}`);
      if (latestMsgId && latestMsgId !== qstashMessageId) {
        console.log(`[worker] Stale job (latest=${latestMsgId}, current=${qstashMessageId}), skipping`);
        return new Response(JSON.stringify({ status: 'stale_job_skipped' }), { status: 200 });
      }
    } catch {
      // allow through
    }
  }

  // Step 7: Clear buffer state
  if (threadId) {
    try { await kvStore.del(`buffer:${threadId}`); } catch { /* ignore */ }
  }

  // Step 8: Human takeover lock check
  if (threadId && await isHumanLocked(threadId, senderEmail)) {
    console.log(`[worker] Human lock active, skipping: ${senderEmail}`);
    return new Response(JSON.stringify({ status: 'human_locked' }), { status: 200 });
  }

  // Step 9: Blacklist re-check
  try {
    const isBlocked = await kvStore.get(`${BLACKLIST_KEY_PREFIX}${senderEmail}`);
    if (isBlocked) {
      console.log(`[worker] Blacklisted sender, skipping: ${senderEmail}`);
      return new Response(JSON.stringify({ status: 'blacklisted' }), { status: 200 });
    }
  } catch {
    // allow through
  }

  // Step 10: Determine processing body and first name
  const processBody = combinedBody || body || '';
  const firstName = extractFirstName(senderField);

  // Step 11: Intent classification (fast-path -> LLM)
  let intent: EmailIntent;
  const fastIntent = fastPathClassify(processBody, {});
  if (fastIntent) {
    intent = fastIntent;
    console.log(`[worker] Fast-path: ${intent}`);
  } else {
    const result = await classifyEmailWithLLM(subject, processBody);
    intent = result.intent;
    console.log(`[worker] LLM classified: ${intent} (${result.reason})`);
  }

  // Step 12: TYPE_D — auto-reply, silent drop
  if (intent === 'TYPE_D_AUTO_REPLY') {
    console.log('[worker] Auto-reply detected, silent drop');
    return new Response(JSON.stringify({ status: 'auto_reply_dropped' }), { status: 200 });
  }

  // Step 13: TYPE_E — unsubscribe, blacklist + confirm
  if (intent === 'TYPE_E_UNSUBSCRIBE') {
    console.log(`[worker] Unsubscribe from: ${senderEmail}`);
    await addToBlacklist(senderEmail, 'unsubscribe');
    const resend = getResend();
    await sendUnsubscribeConfirmation(resend, senderEmail);
    try { await kvStore.set(idempotencyKey, 'true', { ex: 86400 }); } catch { /* ignore */ }
    return new Response(JSON.stringify({ status: 'unsubscribed' }), { status: 200 });
  }

  // ----------------------------------------------------------
  // Step 14: TYPE_A — ACK throttle (CHECK ONLY, increment after send)
  //   FIX BUG1: Do not increment before send. If send fails and
  //   QStash retries, a pre-incremented counter would silence
  //   the retry and user gets zero reply.
  // ----------------------------------------------------------
  let shouldIncrementAck = false;
  let ackKey = '';
  let currentAckCount = 0;

  if (intent === 'TYPE_A_ACK') {
    ackKey = `ack_count:${threadId || senderEmail}`;
    try {
      currentAckCount = (await kvStore.get(ackKey)) as number || 0;
    } catch {
      currentAckCount = 0;
    }
    if (currentAckCount >= CLASSIFICATION.maxConsecutiveAcks) {
      console.log(`[worker] ACK limit reached (${currentAckCount}), silent drop`);
      try { await kvStore.set(idempotencyKey, 'true', { ex: 86400 }); } catch { /* ignore */ }
      return new Response(JSON.stringify({ status: 'ack_silenced' }), { status: 200 });
    }
    shouldIncrementAck = true; // increment AFTER successful send
  } else if (intent === 'TYPE_B_QUESTION') {
    // Reset ACK counter on real question
    if (threadId) {
      try { await kvStore.del(`ack_count:${threadId}`); } catch { /* ignore */ }
    }
  }

  // ----------------------------------------------------------
  // Step 15: TYPE_B — rate limit (CHECK ONLY, increment after send)
  //   FIX BUG2: Do not increment before send. If send fails on
  //   the 3rd email, retry would see count>=3 and forward to
  //   human instead of retrying the AI reply.
  // ----------------------------------------------------------
  let shouldIncrementRate = false;

  if (intent === 'TYPE_B_QUESTION') {
    const currentUsage = await getRateLimitCount(senderEmail);
    if (currentUsage >= RATE_LIMIT_MAX_REPLIES) {
      console.log(`[worker] Rate limit exceeded: ${currentUsage}/${RATE_LIMIT_MAX_REPLIES}, forwarding to human`);
      await setHumanLock(threadId || senderEmail, senderEmail, 'rate_limit_exceeded');
      const resend = getResend();
      await forwardToHuman(resend, senderField, senderEmail, subject, processBody, 'rate_limited_worker');
      try { await kvStore.set(idempotencyKey, 'true', { ex: 86400 }); } catch { /* ignore */ }
      return new Response(JSON.stringify({ status: 'rate_limited_forwarded' }), { status: 200 });
    }
    shouldIncrementRate = true; // increment AFTER successful send
    console.log(`[worker] Rate limit check passed: ${currentUsage}/${RATE_LIMIT_MAX_REPLIES}`);
  }

  // Step 16: Match affiliate links (TYPE_B only)
  const matchedTools = intent === 'TYPE_B_QUESTION'
    ? matchAffiliateLinks(processBody)
    : [];

  // Step 17: Load conversation history
  let history = '';
  if (threadId) {
    try {
      history = (await kvStore.get(`history:${threadId}`)) as string || '';
    } catch {
      history = '';
    }
  }

  // Step 18: Generate reply content
  let replyContent: string;
  try {
    replyContent = await generateReplyContent(
      intent,
      history,
      processBody,
      firstName,
      matchedTools,
      senderEmail,
    );
  } catch (err) {
    console.error('[worker] AI generation failed, using fallback:', err);
    replyContent = FALLBACK_REPLY_TEMPLATE;
  }

  if (!replyContent || replyContent.trim().length < 5) {
    console.warn('[worker] Empty reply, using fallback');
    replyContent = FALLBACK_REPLY_TEMPLATE;
  }

  // Step 19: Send via Resend (plain text + threading headers)
  const resend = getResend();
  const sendHeaders: Record<string, string> = {};
  if (inReplyTo) {
    sendHeaders['In-Reply-To'] = inReplyTo;
    sendHeaders['References'] = inReplyTo;
  }

  await resend.emails.send({
    from: SENDER.from,
    to: senderEmail,
    subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
    text: replyContent,
    headers: Object.keys(sendHeaders).length > 0 ? sendHeaders : undefined,
  });

  console.log(`[worker] Reply sent: ${senderEmail}, intent=${intent}, length=${replyContent.length}`);

  // ----------------------------------------------------------
  // Step 20: Post-send counters (FIX BUG1 + BUG2)
  //   Only increment after successful send. If send failed,
  //   an exception was thrown above and we returned 500, so
  //   QStash will retry with clean counters.
  // ----------------------------------------------------------
  if (shouldIncrementAck && ackKey) {
    try {
      await kvStore.set(ackKey, currentAckCount + 1, { ex: CLASSIFICATION.ackStateTtlSeconds });
      console.log(`[worker] ACK counter incremented: ${currentAckCount + 1}`);
    } catch (err) {
      console.warn('[worker] Failed to increment ACK counter:', err);
    }
  }

  if (shouldIncrementRate) {
    try {
      const newCount = await incrementRateLimit(senderEmail);
      console.log(`[worker] Rate limit incremented: ${newCount}/${RATE_LIMIT_MAX_REPLIES}`);
    } catch (err) {
      console.warn('[worker] Failed to increment rate limit:', err);
    }
  }

  // Step 21: Update conversation history
  if (threadId) {
    try {
      const newEntry = `\n\nUser: ${processBody.slice(0, 2000)}\n\nAlex: ${replyContent.slice(0, 2000)}`;
      let updatedHistory = history + newEntry;
      if (updatedHistory.length > 4000) {
        updatedHistory = updatedHistory.slice(-4000);
      }
      await kvStore.set(`history:${threadId}`, updatedHistory, { ex: DEBOUNCE.historyTtlSeconds });
    } catch (err) {
      console.warn('[worker] Failed to update history:', err);
    }
  }

  // Step 22: Mark idempotent (success)
  try {
    await kvStore.set(idempotencyKey, 'true', { ex: 86400 });
  } catch {
    // ignore
  }

  return new Response(
    JSON.stringify({
      status: 'replied',
      intent,
      sender: senderEmail,
      threadId: threadId || null,
      matchedTools: matchedTools.map(t => t.name),
    }),
    { status: 200 }
  );
};
