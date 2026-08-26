export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey.trim());

      // 1. 添加到 Resend Contacts 列表
      await resend.contacts.create({
        email: email.trim(),
        unsubscribed: false,
      });

      // 2. 发送欢迎邮件
      await resend.emails.send({
        from: 'Alex Automation <alex@wenboom.com>',
        to: [email.trim()],
        subject: 'The 1-person architecture replacing your 5-person team',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 600px; padding: 20px;">
            <h2>Welcome to Alex Automation!</h2>
            <p>Thanks for subscribing. I'm excited to share my automation breakdowns and tool stack insights with you.</p>
            <p>If you ever have any questions, simply reply to this email!</p>
            <br/>
            <p>Best regards,<br/><strong>Alex</strong><br/>Chief Architect @ Alex Automation</p>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
};
