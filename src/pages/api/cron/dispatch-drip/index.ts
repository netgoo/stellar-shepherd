export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import dripEmails from '../../../../data/drip-emails.json';

export const GET: APIRoute = async ({ request }) => {
  // 1. 安全校验（防止非 Vercel Cron 恶意触发）
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ message: 'API key missing' }), { status: 500 });
  }

  const resend = new Resend(apiKey.trim());

  try {
    // 2. 动态获取 Audience ID
    const { data: audiences } = await resend.audiences.list();
    const audienceList = Array.isArray(audiences) ? audiences : (audiences as any)?.data || [];
    const targetAudienceId = audienceList[0]?.id;

    if (!targetAudienceId) {
      return new Response(JSON.stringify({ message: 'No audience found' }), { status: 404 });
    }

    // 3. 获取通讯录全部联系人
    const { data: contactsData } = await resend.contacts.list({ audienceId: targetAudienceId });
    const contacts = Array.isArray(contactsData) ? contactsData : (contactsData as any)?.data || [];

    const now = new Date();
    const emailsToSend: Array<{ from: string; to: string; subject: string; html: string }> = [];

    // 4. 精准防重复与时间匹配算法
    for (const contact of contacts) {
      if (contact.unsubscribed) continue;

      const createdDate = new Date(contact.created_at);
      const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 3600);
      
      // 注册未满 24 小时跳过，避免与欢迎邮件冲突
      if (diffInHours < 24) continue;

      const daysSubscribed = Math.floor(diffInHours / 24);

      // 匹配对应 Day Offset 的邮件
      const matchedEmail = dripEmails.find((item) => item.dayOffset === daysSubscribed);

      if (matchedEmail) {
        emailsToSend.push({
          from: 'Alex Automation <alex@wenboom.com>',
          to: contact.email,
          subject: matchedEmail.subject,
          html: matchedEmail.html,
        });
      }
    }

    // 5. 使用 Resend Batch API 批量发信，防止超时和频控限流
    if (emailsToSend.length > 0) {
      await resend.batch.send(emailsToSend);
    }

    return new Response(
      JSON.stringify({ status: 'success', sentCount: emailsToSend.length }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Drip Dispatch Error:', error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
};
