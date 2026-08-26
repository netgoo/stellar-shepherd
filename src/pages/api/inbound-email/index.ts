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

        await resend.emails.send({
          from: 'Alex Automation <alex@wenboom.com>',
          to: [targetEmail],
          subject: `Re: ${cleanSubject}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 600px; padding: 20px;">
              <p>Hey,</p>
              <p>Thanks for reaching out! I've received your email regarding:</p>
              <blockquote style="border-left: 3px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
                "${cleanSubject}"
              </blockquote>
              <p>I read every message personally and will get back to you shortly.</p>
              <br/>
              <p>Best regards,<br/><strong>Alex</strong><br/>Chief Architect @ Alex Automation</p>
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
