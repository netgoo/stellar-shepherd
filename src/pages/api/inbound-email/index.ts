export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('Received webhook event:', body);

    // 检查是否为 email.received 事件
    if (body.type === 'email.received') {
      const emailData = body.data;
      const rawSender = emailData.from || '';

      // 提取纯邮箱地址 (排除 "Name <email@domain.com>" 中的姓名部分)
      const emailMatch = rawSender.match(/<([^>]+)>/) || [null, rawSender];
      const targetEmail = (emailMatch[1] || rawSender).trim();

      const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

      if (apiKey && targetEmail) {
        const resend = new Resend(apiKey.trim());

        // 给回复邮件的用户发送自动响应
        await resend.emails.send({
          from: 'Alex Automation <alex@wenboom.com>',
          to: [targetEmail],
          subject: `Re: ${emailData.subject || 'Your message to Alex Automation'}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 600px; padding: 20px;">
              <p>Hey,</p>
              <p>Thanks for reaching out! I've received your email regarding:</p>
              <blockquote style="border-left: 3px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
                "${emailData.subject || ''}"
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
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
};
