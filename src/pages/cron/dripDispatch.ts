export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { dripSequence } from '../../../config/dripEmails';

export const POST: APIRoute = async ({request}) => {
  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  const authHeader = request.headers.get('x‑cron‑secret');
  if(authHeader !== cronSecret){
    return new Response(JSON.stringify({status:'unauthorized'}),{status:401});
  }

  try {
    const allKeys = await kvStore.keys('sub:*');
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if(!resendApiKey) throw new Error('missing resend key');
    const resend = new Resend(resendApiKey.trim());

    for(const key of allKeys){
      const record = await kvStore.get(key);
      if(!record) continue;
      const {subscribedAt, sentDripIds} = record as {subscribedAt:number; sentDripIds:string[]};
      const userEmail = key.replace('sub:','');
      const elapsedHours = (Date.now() - subscribedAt) / (1000 * 60 * 60);

      for(const drip of dripSequence){
        if(sentDripIds.includes(drip.dripId)) continue;
        if(elapsedHours >= drip.delayHours){
          await resend.emails.send({
            from:'Alex Automation <alex@wenboom.com>',
            to:[userEmail],
            subject:drip.subject,
            html:drip.htmlBody
          });
          sentDripIds.push(drip.dripId);
          await kvStore.set(key, {subscribedAt, sentDripIds});
        }
      }
    }
    return new Response(JSON.stringify({status:'ok'}),{status:200});
  }catch(e:any){
    console.error('drip dispatch error',e);
    return new Response(JSON.stringify({status:'error',msg:e.message}),{status:500});
  }
};
