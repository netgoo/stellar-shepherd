export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { dripSequence } from '../../../config/dripEmails';
import { generateUnsubscribeToken } from '../../../utils/unsubscribeToken';

async function handleDispatch(request: Request) {
  const authHeader = request.headers.get('x-cron-secret');
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  
  // Vercel Cron authentication - check multiple header patterns for compatibility
  const hasVercelCronJobHeader = request.headers.get('x-vercel-cron-job') === '1';
  const hasVercelCronHeader = !!request.headers.get('x-vercel-cron');
  const isVercelCronUA = request.headers.get('user-agent')?.startsWith('vercel-cron/');
  const isVercelEnvironment = process.env.VERCEL === '1' || import.meta.env.VERCEL === '1';
  const isInternalVercelCron = isVercelEnvironment && (hasVercelCronJobHeader || hasVercelCronHeader || isVercelCronUA);
  
  // If CRON_SECRET is not set, allow Vercel Cron internal triggers without secret
  const hasValidSecret = cronSecret ? authHeader === cronSecret : false;
  
  if (!isInternalVercelCron && !hasValidSecret) {
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
      
      // Generate unsubscribe URL for this user
      const unsubscribeToken = generateUnsubscribeToken(userEmail);
      const unsubscribeUrl = `https://wenboom.com/api/unsubscribe?email=${encodeURIComponent(userEmail)}&token=${unsubscribeToken}`;
      
      // Limit: max 1 drip email per user per cron run to avoid burst sending
      let userSentThisRun = 0;
      
      for (const drip of dripSequence) {
        if (userSentThisRun >= 1) {
          console.log('[drip] user daily limit reached, skip remaining:', userEmail);
          break;
        }
        if (sentDripIds.includes(drip.dripId)) {
          console.log('[drip] skip already sent:', drip.dripId);
          continue;
        }
        
        if (elapsedHours >= drip.delayHours) {
          console.log('[drip] ready to send:', drip.dripId, 'to:', userEmail);
          try {
            // Replace unsubscribe URL placeholder in email body
            const emailHtml = drip.htmlBody.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);
            
            await resend.emails.send({
              from: 'Alex @ Wenboom <alex@wenboom.com>',
              to: [userEmail],
              subject: drip.subject,
              html: emailHtml,
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
              }
            });
            console.log('[drip] send OK:', userEmail, drip.dripId);
            sentDripIds.push(drip.dripId);
            await kvStore.set(key, { subscribedAt, sentDripIds, status });
            sendCount += 1;
            userSentThisRun += 1;
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
