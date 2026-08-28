export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import fs from "fs";
import path from "path";

const EMAIL_DB_PATH = path.resolve("./src/data/subscribers.json");
const DRIP_EMAILS_PATH = path.resolve("./src/data/drip-emails.json");

type SubscriberRecord = {
  email: string;
  subscribedAt: string;
  sentDripIds: number[];
};

export const POST: APIRoute = async ({ request }) => {
  // Vercel Cron 内部调用会注入 VERCEL_CRON 环境变量；外部访问校验header密钥
  const isVercelCronTrigger = !!import.meta.env.VERCEL_CRON;
  const authHeader = request.headers.get("x‑cron‑secret");
  const cronSecret = import.meta.env.CRON_SECRET;

  if(!isVercelCronTrigger && authHeader !== cronSecret){
    return new Response(JSON.stringify({ok:false,msg:"unauthorized"}),{status:403});
  }

  try {
    const rawDb = fs.readFileSync(EMAIL_DB_PATH, "utf‑8");
    const subscribers: SubscriberRecord[] = JSON.parse(rawDb);
    const dripRaw = fs.readFileSync(DRIP_EMAILS_PATH, "utf‑8");
    const dripList = JSON.parse(dripRaw);
    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if(!apiKey) throw new Error("Missing Resend key");
    const resend = new Resend(apiKey.trim());

    let sendCount = 0;
    for(const sub of subscribers){
      const subTime = new Date(sub.subscribedAt);
      for(const drip of dripList){
        if(sub.sentDripIds.includes(drip.id)) continue;
        const dueDate = new Date(subTime);
        dueDate.setDate(subTime.getDate() + drip.dayOffset);
        const now = new Date();
        if(now >= dueDate){
          await resend.emails.send({
            from:"Alex Automation <alex@wenboom.com>",
            to:[sub.email],
            subject:drip.subject,
            html:drip.html
          });
          sub.sentDripIds.push(drip.id);
          sendCount +=1;
        }
      }
    }
    fs.writeFileSync(EMAIL_DB_PATH,JSON.stringify(subscribers,null,2));
    return new Response(JSON.stringify({ok:true,sent:sendCount}),{status:200});
  }catch(err:any){
    console.error(err);
    return new Response(JSON.stringify({ok:false,error:err.message}),{status:500});
  }
};
