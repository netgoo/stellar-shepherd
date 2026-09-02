export const prerender = false;
import type { APIRoute } from 'astro';
import { processInboundEmail } from '../../../lib/reply-engine';
import { kvStore } from '../../../lib/kvServer';

// Idempotency TTL: 24 hours (same email replayed within 24h is ignored)
const IDEMPOTENCY_TTL_SECONDS = 86400;

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
    // ------------------------------------------------------------
    // Step 2: Only process email.received events
    // ------------------------------------------------------------
    if (body?.type !== 'email.received') {
      return new Response(
        JSON.stringify({ status: 'ignored', type: body?.type }),
        { status: 200 }
      );
    }

    const emailData = body.data || {};
    const rawFrom = String(emailData.from || '');

    // ------------------------------------------------------------
    // Step 3: Extract pure email address (prevents name-injection bypass)
    //   "alex@wenboom.com Fans" <hacker@gmail.com> -> hacker@gmail.com
    // ------------------------------------------------------------
    const emailMatch = rawFrom.match(/<([^>]+)>/) || [null, rawFrom];
    const senderEmail = (emailMatch[1] || rawFrom).trim().toLowerCase();

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
    // Step 5: Idempotency check (prevents duplicate replies from webhook retries)
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
      // Mark as processed BEFORE running AI logic (crash-safe idempotency)
      await kvStore.set(idempotencyKey, 'true', { ex: IDEMPOTENCY_TTL_SECONDS });
    }

    // ------------------------------------------------------------
    // Step 6: Process with AI reply engine
    //   Groq Llama 3.1 70B + affiliate link matching + human intervention
    //   Typical latency: 3-6s (well within Vercel 10s serverless limit)
    // ------------------------------------------------------------
    console.log('[inbound-email] Processing from:', senderEmail);

    const result = await processInboundEmail(body);

    console.log('[inbound-email] Result:', result.status, result.reason || '');

    return new Response(
      JSON.stringify({ status: 'success', result }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[inbound-email] Processing error:', error?.message || error);
    return new Response(
      JSON.stringify({ status: 'error', message: error?.message || 'Unknown error' }),
      { status: 500 }
    );
  }
};
