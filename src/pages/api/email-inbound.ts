// ============================================================
// Resend Inbound Email Webhook Endpoint
// ============================================================
import type { APIRoute } from 'astro';
import { processInboundEmail } from '../../lib/reply-engine';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Webhook secret validation (prevent abuse)
    // Supports: URL ?token=xxx OR header x-webhook-secret: xxx
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || request.headers.get('x-webhook-secret');
    const expectedSecret = import.meta.env.INBOUND_WEBHOOK_SECRET || process.env.INBOUND_WEBHOOK_SECRET;

    if (expectedSecret && token !== expectedSecret) {
      console.warn('[inbound] Unauthorized webhook request');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = await request.json();

    // Process email (async, but we wait for result to return status)
    const result = await processInboundEmail(payload);

    // Return 200 to acknowledge webhook (Resend retries on non-200)
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[inbound] Processing failed:', error?.message || error);
    // Still return 200 to prevent Resend from retrying a broken payload
    // (actual error is logged and forwarded to human in reply-engine)
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Unknown error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// GET handler for health check / testing
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'wenboom-inbound-email',
    time: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
