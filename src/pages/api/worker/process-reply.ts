// ============================================================
// QStash Worker - Process delayed email reply (v4.1.5)
// v4.1.3: Added markdownToHtml + HTML email rendering (clickable links).
//         Fixed CLASSIFICATION import missing in v4.1.2.
// v4.1.4: FIX debounce merge bug — Worker now prefers combinedBody
//         (merged multi-email content) over single-email body.
// v4.1.5: Production hardening — 3 bug fixes:
//   BUG1 (HIGH): Strip <> from inReplyTo before re-wrapping to avoid
//         double angle brackets (<<id>>) violating RFC 2822, which
//         causes Gmail/Outlook to mark as spam or 550 reject.
//   BUG2 (MED): Defer buffer/latestKey deletion until after Resend
//         send success. Early deletion caused stale-state on QStash
//         retry and duplicate replies on concurrent inbound emails.
//   BUG3 (MED): Rewrite markdownToHtml with extract-then-escape
//         pattern so URL query params (&utm_*) are NOT corrupted
//         by HTML entity escaping. Added target=_blank + rel safety.
// ============================================================
export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { verifyQstashWebhook } from '../../../lib/qstash-client';
import {
  BLACKLIST_KEY_PREFIX,
  RATE_LIMIT_MAX_REPLIES,
  RATE_LIMIT_KEY_PREFIX,
  RATE_LIMIT_WINDOW_SECONDS,
  HUMAN_LOCK,
  DEBOUNCE,
  SENDER,
  FALLBACK_REPLY_TEMPLATE,
  CLASSIFICATION,
} from '../../../config/reply-config';
import {
  fastPathClassify,
  classifyEmailWithLLM,
  matchAffiliateLinks,
  generateReplyContent,
  extractFirstName,
  validateAndFixLinks,
} from '../../../lib/reply-engine';
import type { QueuedReply } from '../../../lib/qstash-client';
const IDEMPOTENCY_TTL_SECONDS = 86400;
// ------------------------------------------------------------
// Markdown to HTML converter (v4.1.5: extract-then-escape pattern)
//   1. Extract Markdown links to placeholders (preserve raw URL &)
//   2. Escape HTML entities on remaining text
//   3. Restore links with safe attributes
//   4. Bold / italic / paragraphs
// This prevents URL query params like &utm_medium= from being
// corrupted into &amp;utm_medium= by premature entity escaping.
// ------------------------------------------------------------
function markdownToHtml(text: string): string {
  // Step 1: Extract all Markdown links, replace with placeholders
  const links: Array<{ text: string; url: string }> = [];
  let protectedText = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (match, linkText: string, url: string) => {
      links.push({ text: linkText, url });
      return `__LINK_PLACEHOLDER_${links.length - 1}__`;
    }
  );
  // Step 2: Escape HTML entities (safe — no URLs remain in text)
  protectedText = protectedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Step 3: Restore placeholders as anchor tags (raw URL, safe attrs)
  protectedText = protectedText.replace(
    /__LINK_PLACEHOLDER_(\d+)__/g,
    (match, indexStr: string) => {
      const idx = parseInt(indexStr, 10);
      const link = links[idx];
      if (!link) return match;
      return `<a href="${link.url}" style="color:#2563eb;text-decoration:underline;" target="_blank" rel="noopener noreferrer">${link.text}</a>`;
    }
  );
  // Step 4: Bold **text**
  protectedText = protectedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Step 5: Italic *text*
  protectedText = protectedText.replace(/(^|\s)\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // Step 6: Paragraphs
  const paragraphs = protectedText.split(/\n\n+/);
  protectedText = paragraphs.map(p => {
    p = p.replace(/\n/g, '<br>');
    return `<p style="margin:0 0 14px 0;line-height:1.65;">${p}</p>`;
  }).join('');
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#222;line-height:1.65;">${protectedText}</div>`;
}
function getResend(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('[worker] RESEND_API_KEY is not configured');
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
    await kvStore.set(key, next, { ex: RATE_LIMIT_WINDOW_SECONDS });
    return next;
  } catch {
    return 0;
  }
}
async function getAckCount(threadId: string): Promise<number> {
  try {
    const key = `ack_count:${threadId}`;
    const count = await kvStore.get(key);
    return typeof count === 'number' ? count : 0;
  } catch {
    return 0;
  }
}
async function incrementAckCount(threadId: string): Promise<number> {
  try {
    const key = `ack_count:${threadId}`;
    const current = await getAckCount(threadId);
    const next = current + 1;
    await kvStore.set(key, next, { ex: CLASSIFICATION.ackStateTtlSeconds });
    return next;
  } catch {
    return 0;
  }
}
export const POST: APIRoute = async ({ request }) => {
  // Step 1: Read raw body for JWS verification
  const rawBody = await request.text();
  const signature = request.headers.get('upstash-signature') || '';
  // Step 2: Verify JWS signature
  const isValid = await verifyQstashWebhook(signature, rawBody);
  if (!isValid) {
    console.warn('[worker] Invalid QStash signature, rejecting');
    return new Response(JSON.stringify({ status: 'error', message: 'Invalid signature' }), { status: 403 });
  }
  // Step 3: Parse JSON
  let data: QueuedReply;
  try {
    data = JSON.parse(rawBody);
  } catch {
    console.warn('[worker] Invalid JSON body');
    return new Response(JSON.stringify({ status: 'error', message: 'Invalid JSON' }), { status: 400 });
  }
  // Destructure (v4.1.4: combinedBody for debounce merge)
  const {
    emailId, senderEmail, senderField, subject, body,
    threadId, inReplyTo, firstMessageAt, combinedBody,
  } = data;
  // === DEBUG: Log body + combinedBody content ===
  console.log(`[worker] DEBUG: from=${senderEmail}, subject="${subject}", bodyLength=${body?.length || 0}, combinedBodyLength=${combinedBody?.length || 0}, bodyPreview="${(body || '').substring(0, 100).replace(/\n/g, ' ')}", combinedPreview="${(combinedBody || '').substring(0, 100).replace(/\n/g, ' ')}"`);
  // === v4.1.4: Prefer combinedBody (debounce merged) over single-email body ===
  let effectiveBody = '';
  if (combinedBody && combinedBody.trim().length > 0) {
    effectiveBody = combinedBody;
    console.log(`[worker] Using combinedBody (debounce merged, ${combinedBody.length} chars)`);
  } else if (body && body.trim().length > 0) {
    effectiveBody = body;
  }
  if (effectiveBody.trim().length < 5) {
    console.warn(`[worker] Body too short (${effectiveBody.length} chars), using subject as fallback`);
    effectiveBody = `Subject: ${subject}\n\n(Email body was empty or too short — user may have sent an image-only or empty email.)`;
  }
  console.log(`[worker] Processing: ${emailId}, from: ${senderEmail}, thread: ${threadId}`);
  // Step 4: Idempotency
  const qstashMessageId = request.headers.get('upstash-message-id') || data.qstashMessageId || emailId;
  if (qstashMessageId) {
    const idempotencyKey = `processed_qstash:${qstashMessageId}`;
    const alreadyProcessed = await kvStore.get(idempotencyKey);
    if (alreadyProcessed) {
      console.log('[worker] Duplicate QStash message, skipping:', qstashMessageId);
      return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
    }
  }
  // Step 5: Latest check (v4.1.5: READ-ONLY — do NOT delete buffer here)
  // Defer buffer cleanup until after Resend send success (Step 21) to
  // preserve state for QStash retries and concurrent inbound emails.
  if (threadId) {
    try {
      const latestKey = `latest:${threadId}`;
      const latestId = await kvStore.get(latestKey);
      if (latestId && latestId !== qstashMessageId) {
        console.log(`[worker] Stale job (latest=${latestId}, this=${qstashMessageId}), skipping`);
        if (qstashMessageId) {
          await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
        }
        return new Response(JSON.stringify({ status: 'stale_skipped' }), { status: 200 });
      }
      // v4.1.5: buffer/latestKey NOT deleted here — deferred to Step 21
    } catch { /* ignore */ }
  }
  // Step 6: Human takeover lock
  try {
    const lockByEmail = await kvStore.get(`${HUMAN_LOCK.keyPrefix}${senderEmail}`);
    const lockByThread = threadId ? await kvStore.get(`${HUMAN_LOCK.keyPrefix}${threadId}`) : null;
    if (lockByEmail || lockByThread) {
      console.log('[worker] Human lock active, skipping AI reply');
      if (qstashMessageId) {
        await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
      }
      return new Response(JSON.stringify({ status: 'human_locked' }), { status: 200 });
    }
  } catch { /* ignore */ }
  // Step 7: Blacklist re-check
  try {
    const blacklistKey = `${BLACKLIST_KEY_PREFIX}${senderEmail}`;
    const isBlocked = await kvStore.get(blacklistKey);
    if (isBlocked) {
      console.log(`[worker] Blacklisted sender: ${senderEmail}, skipping`);
      if (qstashMessageId) {
        await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
      }
      return new Response(JSON.stringify({ status: 'blacklisted' }), { status: 200 });
    }
  } catch { /* ignore */ }
  // Step 8: Intent classification
  let intent;
  const fastIntent = fastPathClassify(effectiveBody, {});
  if (fastIntent) {
    intent = fastIntent;
    console.log(`[worker] Fast-path: ${intent}`);
  } else {
    const result = await classifyEmailWithLLM(subject, effectiveBody);
    intent = result.intent;
    console.log(`[worker] LLM classified: ${intent} (${result.reason})`);
  }
  // Step 9: TYPE_D - auto reply, silent
  if (intent === 'TYPE_D_AUTO_REPLY') {
    console.log('[worker] TYPE_D auto-reply, silent skip');
    if (qstashMessageId) {
      await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
    }
    return new Response(JSON.stringify({ status: 'silent', type: 'TYPE_D' }), { status: 200 });
  }
  // Step 10: TYPE_E - unsubscribe
  if (intent === 'TYPE_E_UNSUBSCRIBE') {
    console.log('[worker] TYPE_E unsubscribe, blacklisting');
    try {
      await kvStore.set(`${BLACKLIST_KEY_PREFIX}${senderEmail}`, { reason: 'unsubscribe_worker', addedAt: Date.now() });
    } catch { /* ignore */ }
    try {
      const resend = getResend();
      await resend.emails.send({
        from: SENDER.from,
        to: senderEmail,
        subject: 'You have been unsubscribed',
        text: 'You have been successfully unsubscribed from Wenboom emails.\n\nBest,\nAlex\nWenboom.com',
      });
    } catch { /* ignore */ }
    if (qstashMessageId) {
      await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
    }
    return new Response(JSON.stringify({ status: 'unsubscribed' }), { status: 200 });
  }
  // Step 11: TYPE_A - ACK limit
  if (intent === 'TYPE_A_ACK' && threadId) {
    const ackCount = await getAckCount(threadId);
    if (ackCount >= CLASSIFICATION.maxConsecutiveAcks) {
      console.log(`[worker] TYPE_A ACK limit reached (${ackCount}/${CLASSIFICATION.maxConsecutiveAcks}), silent`);
      if (qstashMessageId) {
        await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
      }
      return new Response(JSON.stringify({ status: 'ack_silenced' }), { status: 200 });
    }
  }
  // Step 12: TYPE_B - rate limit
  if (intent === 'TYPE_B_QUESTION') {
    const count = await getRateLimitCount(senderEmail);
    if (count >= RATE_LIMIT_MAX_REPLIES) {
      console.log(`[worker] Rate limit exceeded (${count}/${RATE_LIMIT_MAX_REPLIES}), forwarding human`);
      try {
        const resend = getResend();
        await resend.emails.send({
          from: 'Alex (Inbound System) <alex@wenboom.com>',
          to: ['hi@aicode8.com', 'guixinji@outlook.com'],
          subject: `[RATE LIMIT EXCEEDED] ${subject}`,
          replyTo: senderEmail,
          text: `Sender: ${senderField}\nSubject: ${subject}\n\n${effectiveBody.substring(0, 5000)}`,
        });
      } catch { /* ignore */ }
      if (qstashMessageId) {
        await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
      }
      return new Response(JSON.stringify({ status: 'rate_limited_forwarded' }), { status: 200 });
    }
  }
  // Step 13: Match affiliate links
  const matchedTools = matchAffiliateLinks(effectiveBody).slice(0, 2);
  console.log(`[worker] Matched tools: ${matchedTools.map(t => t.name).join(', ') || 'none'}`);
  // Step 14: Load thread history
  let history = '';
  if (threadId) {
    try {
      history = (await kvStore.get(`history:${threadId}`)) || '';
    } catch { /* ignore */ }
  }
  // Step 15: Extract first name
  const firstName = extractFirstName(senderField);
  console.log(`[worker] firstName extracted: "${firstName}" (senderField="${senderField}")`);
  // Step 16: Generate reply
  let replyText: string;
  try {
    replyText = await generateReplyContent(intent, history, effectiveBody, firstName, matchedTools, senderEmail);
    replyText = validateAndFixLinks(replyText);
    console.log(`[worker] Generated reply length: ${replyText.length}`);
  } catch (err) {
    console.error('[worker] Generation failed, using fallback:', err);
    replyText = FALLBACK_REPLY_TEMPLATE;
  }
  // Step 17: Send via Resend (HTML + text multipart)
  // v4.1.5 BUG1 FIX: Strip existing <> from inReplyTo before re-wrapping
  // to prevent double angle brackets (<<id>>) violating RFC 2822.
  const resend = getResend();
  const htmlContent = markdownToHtml(replyText);
  const cleanInReplyTo = inReplyTo ? inReplyTo.replace(/[<>]/g, '').trim() : null;
  const sendResult = await resend.emails.send({
    from: SENDER.from,
    to: senderEmail,
    subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
    text: replyText,
    html: htmlContent,
    headers: cleanInReplyTo ? {
      'In-Reply-To': `<${cleanInReplyTo}>`,
      'References': `<${cleanInReplyTo}>`,
    } : undefined,
  });
  console.log(`[worker] Reply sent: ${sendResult?.id || 'unknown'}, intent: ${intent}, length: ${replyText.length}`);
  // Step 18: ACK count increment
  if (intent === 'TYPE_A_ACK' && threadId) {
    const newAck = await incrementAckCount(threadId);
    console.log(`[worker] ACK count incremented: ${newAck}`);
  }
  // Step 19: Rate limit increment
  if (intent === 'TYPE_B_QUESTION') {
    const newCount = await incrementRateLimit(senderEmail);
    console.log(`[worker] Rate limit incremented: ${newCount}/${RATE_LIMIT_MAX_REPLIES}`);
  }
  // Step 20: Update history
  if (threadId) {
    try {
      const newHistory = `${history ? history + '\n\n' : ''}--- User (${new Date().toISOString()}) ---\n${effectiveBody.substring(0, 2000)}\n\n--- Alex (${new Date().toISOString()}) ---\n${replyText.substring(0, 2000)}`;
      const trimmed = newHistory.length > 4000 ? newHistory.substring(newHistory.length - 4000) : newHistory;
      await kvStore.set(`history:${threadId}`, trimmed, { ex: DEBOUNCE.historyTtlSeconds });
    } catch { /* ignore */ }
  }
  // Step 21: Mark idempotency + clean up buffer (v4.1.5: AFTER successful send)
  if (qstashMessageId) {
    await kvStore.set(`processed_qstash:${qstashMessageId}`, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
  }
  // v4.1.5 BUG2 FIX: Delete buffer/latestKey ONLY after Resend send success.
  // This preserves state for QStash retries (on 500) and prevents
  // concurrent inbound emails from creating duplicate pending tasks.
  if (threadId) {
    try {
      await kvStore.del(`buffer:${threadId}`);
      await kvStore.del(`latest:${threadId}`);
    } catch { /* ignore */ }
  }
  return new Response(JSON.stringify({ status: 'replied', intent, messageId: sendResult?.id }), { status: 200 });
};
