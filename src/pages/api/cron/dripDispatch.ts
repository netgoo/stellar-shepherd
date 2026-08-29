export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { dripSequence } from '../../../config/dripEmails';

async function handleDispatch(request: Request) {
  const authHeader = request.headers.get('x-cron-secret');
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  const isInternalVercelCron = process.env.VERCEL === '1'
    && request.headers.get('user-agent')?.startsWith('vercel-cron/');

  if (!isInternalVercelCron && authHeader !== cronSecret) {
    return new Response(JSON.stringify({ ok: false, msg: 'unauthorized' }), { status: 403 });
  }

  try {
    console.log('dripDispatch start run');
    const allKeys = await kvStore.keys('sub:*');
    console.log('found sub keys count:', allKeys.length);

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('Missing Resend key');
    const resend = new Resend(apiKey.trim());

    let sendCount = 0;
    console.log('dripSequence length:', dripSequence.length);

    for (const key of allKeys) {
      const record = await kvStore.get(key);
      if (!record) continue;
      const userEmail = key.replace('sub:', '');
      console.log('process subscriber:', userEmail, JSON.stringify(record));

      const subscribedAt:number = record.subscribedAt;
      let sentDripIds:string[] = record.sentDripIds ?? [];

      const elapsedHours = (Date.now() - subscribedAt) / (1000 * 60 * 60);
      console.log('elapsedHours:', elapsedHours);

      for (const drip of dripSequence) {
        console.log('check dripId:', drip.dripId, 'delayHours:', drip.delayHours);
        if (sentDripIds.includes(drip.dripId)) {
          console.log('already sent, skip:', drip.dripId);
          continue;
        }
        if (elapsedHours >= drip.delayHours) {
          console.log('ready to send:', drip.dripId);
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

    console.log('dripDispatch finished, sendCount:', sendCount);
    return new Response(JSON.stringify({ ok: true, sent: sendCount }), { status: 200 });
  } catch (err: any) {
    console.error('dripDispatch error:', err);
    return new Response(JSON.stringify({ ok: false, error: err?.message ?? 'unknown' }), { status: 500 });
  }
}

export const POST: APIRoute = async ({ request }) => handleDispatch(request);
export const GET: APIRoute = async ({ request }) => handleDispatch(request);
