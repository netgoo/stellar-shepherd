export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (body.type === 'email.received') {
      const emailData = body.data;
      const rawSender = emailData.from || '';

      // 1. 提取纯邮箱地址
      const emailMatch = rawSender.match(/<([^>]+)>/) || [null, rawSender];
      const targetEmail = (emailMatch[1] || rawSender).trim().toLowerCase();

      // 2. 防死循环校验：如果发件人就是系统自己 (alex@wenboom.com)，直接终止处理
      if (targetEmail.includes('alex@wenboom.com')) {
        console.log('Ignore automated reply loop from self.');
        return new Response(JSON.stringify({ status: 'ignored_self_reply' }), { status: 200 });
      }

      // 3. 规范邮件主题，避免重复叠加 "Re: Re: 回复:"
      let cleanSubject = emailData.subject || 'Your message to Alex Automation';
      cleanSubject = cleanSubject.replace(/^(Re:\s*|回复:\s*)+/gi, '').trim();

      const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

      if (apiKey && targetEmail) {
        const resend = new Resend(apiKey.trim());

        // 4. 发送优化后的方案 A 自动应答邮件
        await resend.emails.send({
          from: 'Alex Automation <alex@wenboom.com>',
          to: [targetEmail],
          subject: `Re: ${cleanSubject}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 600px; padding: 20px;">
              <p>Hey,</p>
              
              <p>Got it! Thanks for reaching out. I've received your note regarding:</p>
              
              <blockquote style="border-left: 3px solid #F3C653; margin: 15px 0; padding-left: 15px; color: #555; font-style: italic;">
                "${cleanSubject}"
              </blockquote>
              
              <p>I review every message personally to see how we can optimize and automate these exact manual bottlenecks.</p>
              
              <p>I’m currently reviewing your note and will get back to you with a tailored breakdown shortly.</p>
              
              <br/>
              <p>To your leverage,<br/>
              <strong>Alex</strong><br/>
              <span style="font-size: 0.85rem; color: #666;">Chief Architect @ Alex Automation</span></p>
            </div>
          `,
        });
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
};
