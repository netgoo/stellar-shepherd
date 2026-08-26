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

      // 1. 保存至 Resend Contacts 列表
      await resend.contacts.create({
        email: email.trim(),
        unsubscribed: false,
      });

      // 2. 发送 Welcome 欢迎邮件（已更新文本内容）
      await resend.emails.send({
        from: 'Alex Automation <alex@wenboom.com>',
        to: [email.trim()],
        subject: 'The 1-person architecture replacing your 5-person team',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 600px; padding: 20px;">
            <p>Hey,</p>
            
            <p>Welcome to Alex Automation (hosted at <a href="https://wenboom.com" style="color: #0066cc;">wenboom.com</a>). If you are reading this, you are likely exhausted from bleeding cash on bloated SaaS subscriptions, brittle custom code, and redundant human overhead.</p>
            
            <p>Most SMB founders try to fix operational friction by throwing more headcount or expensive enterprise software at it. That is simply a tax on bad architecture.</p>
            
            <blockquote style="border-left: 3px solid #ccc; margin: 20px 0; padding-left: 15px; color: #555; font-style: italic;">
              "The goal isn't to work harder. It's to build a protocol-level automated infrastructure where marginal cost approaches zero."
            </blockquote>
            
            <p>Over the coming weeks, I’m going to unpack the exact JSON payloads, orchestration blueprints, and hard ROI accounting models we use to help lean teams achieve asymmetric leverage.</p>
            
            <p>To start building your foundation right now, explore our core command center at <a href="https://wenboom.com" style="color: #0066cc;">wenboom.com</a>—this is the exact protocol layer we rely on to cut operational overhead by 80%.</p>
            
            <p><strong>Hit reply and tell me:</strong> What is the single most expensive manual workflow currently draining your margin? (I personally read and reply to every single message).</p>
            
            <p>To your leverage,<br/>
            <strong>Alex</strong>, Chief Architect @ Alex Automation</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 15px 0;" />
            
            <p style="font-size: 0.85rem; color: #777;">
              You are receiving this email because you subscribed at wenboom.com. Reply directly to this email if you'd like to unsubscribe or reach out to us!
            </p>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
};
