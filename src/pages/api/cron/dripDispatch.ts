export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { dripSequence } from '../../../config/dripEmails';
import { generateUnsubscribeToken } from '../../../utils/unsubscribeToken';

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'https://wenboom.com';

async function handleDispatch(request: Request) {
  const isVercelCronTrigger = request.headers.get('user-agent')?.startsWith('vercel-cron/');
  const authHeader = request.headers.get('x-cron-secret');
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  if (!isVercelCronTrigger && authHeader !== cronSecret) {
    return new Response(JSON.stringify({ ok: false, msg: 'unauthorized' }), { status: 403 });
  }
  try {
    console.log('[drip] start, subscribers keys:', await kvStore.keys('sub:*'));
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
      console.log('[drip] process:', userEmail, 'elapsedHours:', elapsedHours, 'sent:', sentDripIds);
      for (const drip of dripSequence) {
        // === 临时测试：强制重发，测试完恢复下一行 ===
        // if (sentDripIds.includes(drip.dripId)) continue;
        if (elapsedHours >= drip.delayHours) {
          console.log('[drip] ready to send:', drip.dripId, 'to:', userEmail);
          const normalizedEmail = userEmail.trim().toLowerCase();
          const token = generateUnsubscribeToken(normalizedEmail);
          const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;
          const finalHtml = drip.htmlBody.replace(
            /\[Unsubscribe Here\]/g,
            `<a href="${unsubscribeUrl}" style="color:#888888;text-decoration:underline;">Unsubscribe Here</a>`
          );
          const result = await resend.emails.send({
            from: 'Alex Automation <alex@wenboom.com>',
            to: [userEmail],
            subject: drip.subject,
            html: finalHtml,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          });
          if (result.error) {
            console.error('[drip] Resend send FAILED:', userEmail, result.error);
            continue;
          }
          console.log('[drip] Resend send OK:', userEmail, 'id:', result.data?.id);
          sentDripIds.push(drip.dripId);
          await kvStore.set(key, { subscribedAt, sentDripIds });
          sendCount += 1;
        }
      }
    }
    console.log('[drip] finished, sendCount:', sendCount);
    return new Response(JSON.stringify({ ok: true, sent: sendCount }), { status: 200 });
  } catch (err: any) {
    console.error('[drip] error:', err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}

export const POST: APIRoute = async ({ request }) => handleDispatch(request);
export const GET: APIRoute = async ({ request }) => handleDispatch(request);
