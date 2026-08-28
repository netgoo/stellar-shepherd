export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { dripSequence } from '../../../config/dripEmails';

async function handleDispatch(request: Request) {
  const isVercelCronTrigger = request.headers.get('x-vercel-cron-job') === '1';
  const authHeader = request.headers.get('x-cron-secret');
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  if (!isVercelCronTrigger && authHeader !== cronSecret) {
    return new Response(JSON.stringify({ ok: false, msg: 'unauthorized' }), { status: 403 });
  }
  try {
    const allKeys = await kvStore.keys('sub:*');
    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('Missing Resend key');
    const resend = new Resend(apiKey.trim());
    let sendCount = 0;
    for (const key of allKeys) {
      const record = await kvStore.get(key);
      if (!record) continue;
      const { subscribedAt, sentDripIds } = record as { subscribedAt: number; sentDripIds: string[] };
      const userEmail = key.replace('sub:', '');
      const elapsedHours = (Date.now() - subscribedAt) / (1000 * 60 * 60);
      for (const drip of dripSequence) {
        if (sentDripIds.includes(drip.dripId)) continue;
        if (elapsedHours >= drip.delayHours) {
          await resend.emails.send({
            from: 'Alex Automation <alex@wenboom.com>',
            to: [userEmail],
            subject: drip.subject,
            html: drip.htmlBody
          });
          sentDripIds.push(drip.dripId);
          await kvStore.set(key, { subscribedAt, sentDripIds });
          sendCount += 1;
        }
      }
    }
    return new Response(JSON.stringify({ ok: true, sent: sendCount }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}

export const POST: APIRoute = async ({ request }) => handleDispatch(request);
export const GET: APIRoute = async ({ request }) => handleDispatch(request);
