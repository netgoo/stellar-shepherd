export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { dripSequence } from '../../../config/dripEmails';

async function handleDispatch(request: Request) {
  const authHeader = request.headers.get('x-cron-secret');
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;

  const hasVercelCronHeader = !!request.headers.get('x-vercel-cron');
  const isVercelCronUA = request.headers.get('user-agent')?.startsWith('vercel-cron/');
  const isInternalVercelCron = process.env.VERCEL === '1' && (hasVercelCronHeader || isVercelCronUA);

  if (!isInternalVercelCron && authHeader !== cronSecret) {
    return new Response(JSON.stringify({ ok: false, msg: 'unauthorized' }), { status: 403 });
  }

  try {
    console.log('[drip] start run');
    const allKeys = await kvStore.keys('sub:*');
    console.log('[drip] found subscribers:', allKeys.length);

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('Missing Resend key');
    const resend = new Resend(apiKey.trim());

    let sendCount = 0;

    for (const key of allKeys) {
      const record = await kvStore.get(key);
      if (!record) continue;

      const userEmail = key.replace('sub:', '');
      const { subscribedAt, sentDripIds = [], status } = record as {
        subscribedAt: number;
        sentDripIds: string[];
        status?: string;
      };

      if (status === 'unsubscribed') {
        console.log('[drip] skip unsubscribed:', userEmail);
        continue;
      }

      const elapsedHours = (Date.now() - subscribedAt) / (1000 * 60 * 60);
      console.log('[drip] process:', userEmail, 'elapsedHours:', elapsedHours, 'sent:', sentDripIds);

      for (const drip of dripSequence) {
        if (sentDripIds.includes(drip.dripId)) {
          console.log('[drip] skip already sent:', drip.dripId);
          continue;
        }
        if (elapsedHours >= drip.delayHours) {
          console.log('[drip] ready to send:', drip.dripId, 'to:', userEmail);
          try {
            await resend.emails.send({
              from: 'Alex @ Wenboom <alex@wenboom.com>',
              to: [userEmail],
              subject: drip.subject,
              html: drip.htmlBody
            });
            console.log('[drip] send OK:', userEmail, drip.dripId);
            sentDripIds.push(drip.dripId);
            await kvStore.set(key, { subscribedAt, sentDripIds, status });
            sendCount += 1;
          } catch (sendErr: any) {
            console.error('[drip] send FAILED:', userEmail, drip.dripId, sendErr?.message);
          }
        }
      }
    }

    console.log('[drip] finished, sendCount:', sendCount);
    return new Response(JSON.stringify({ ok: true, sent: sendCount }), { status: 200 });
  } catch (err: any) {
    console.error('[drip] error:', err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? 'unknown' }), { status: 500 });
  }
}

export const POST: APIRoute = async ({ request }) => handleDispatch(request);
export const GET: APIRoute = async ({ request }) => handleDispatch(request);
