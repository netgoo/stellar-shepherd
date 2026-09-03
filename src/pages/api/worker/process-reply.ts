// ============================================================
// QStash Worker - Process delayed email reply after queue timeout
// Called by Upstash QStash when the delayed message is due.
// Verifies QStash signature, then delegates to reply-engine.
// ============================================================
export const prerender = false;
import type { APIRoute } from 'astro';
import { processInboundEmail } from '../../../lib/reply-engine';
import { verifyQstashWebhook, type QueuedReply } from '../../../lib/qstash-client';

export const POST: APIRoute = async ({ request }) => {
  // ------------------------------------------------------------
  // Step 1: Read raw body (required for signature verification)
  //   Must use .text() — signature is computed over raw bytes.
  // ------------------------------------------------------------
  const rawBody = await request.text();

  // ------------------------------------------------------------
  // Step 2: Verify QStash signature (reject forged requests)
  // ------------------------------------------------------------
  const signature = request.headers.get('upstash-signature') || '';
  const isValid = await verifyQstashWebhook(signature, rawBody);
  if (!isValid) {
    console.warn('[worker] Invalid QStash signature, rejecting request');
    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid signature' }),
      { status: 403 }
    );
  }

  // ------------------------------------------------------------
  // Step 3: Parse queued payload (safe JSON)
  // ------------------------------------------------------------
  let queued: QueuedReply;
  try {
    queued = JSON.parse(rawBody);
  } catch {
    console.warn('[worker] Invalid JSON body received');
    return new Response(
      JSON.stringify({ status: 'error', message: 'Invalid JSON body' }),
      { status: 400 }
    );
  }

  // ------------------------------------------------------------
  // Step 4: Log human-like delay (for monitoring/verification)
  // ------------------------------------------------------------
  const delayMinutes = queued.receivedAt
    ? ((Date.now() - queued.receivedAt) / 60000).toFixed(1)
    : 'unknown';
  console.log(`[worker] Processing queued reply from: ${queued.senderEmail}, queue delay: ${delayMinutes}min`);

  // ------------------------------------------------------------
  // Step 5: Transform QueuedReply -> Resend webhook payload format
  //   processInboundEmail expects { type, data: { from, subject, text } }
  // ------------------------------------------------------------
  const payload = {
    type: 'email.received',
    data: {
      id: queued.emailId,
      from: queued.senderField,
      subject: queued.subject,
      text: queued.body,
    },
  };

  // ------------------------------------------------------------
  // Step 6: Process email (AI generation + send via Resend)
  //   On success -> 200 (QStash marks done, no retry)
  //   On failure -> 500 (QStash retries up to 2x, dedup prevents double-send)
  // ------------------------------------------------------------
  try {
    const result = await processInboundEmail(payload);
    console.log(`[worker] Result: ${result.status} ${result.reason || ''}`);
    return new Response(
      JSON.stringify({ status: 'success', result }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[worker] Processing failed:', error?.message || error);
    return new Response(
      JSON.stringify({ status: 'error', message: error?.message || 'Unknown error' }),
      { status: 500 }
    );
  }
};
