export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ status: 'error', message: 'Email is required' }), { status: 400 });
    }

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ status: 'error', message: 'API key not configured' }), { status: 500 });
    }

    const resend = new Resend(apiKey.trim());

    const [contactRes, emailRes] = await Promise.all([
      fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          unsubscribed: false,
        }),
      }),
      
      resend.emails.send({
        // 1. 发件人修改为自定义的前缀 alex@wenboom.com
        from: 'Alex Automation <alex@wenboom.com>',
        to: [email],
        subject: 'The 1-person architecture replacing your 5-person team',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #111; line-height: 1.6;">
            <p style="font-size: 16px;">Hey,</p>
            
            <p style="font-size: 16px;">Welcome to <strong>Alex Automation</strong> (hosted at <a href="https://wenboom.com" style="color: #000; font-weight: bold; text-decoration: underline;">wenboom.com</a>). If you are reading this, you are likely exhausted from bleeding cash on bloated SaaS subscriptions, brittle custom code, and redundant human overhead.</p>
            
            <p style="font-size: 16px;">Most SMB founders try to fix operational friction by throwing more headcount or expensive enterprise software at it. That is simply a tax on bad architecture.</p>
            
            <div style="border-left: 3px solid #000; padding-left: 15px; margin: 25px 0; font-style: italic; color: #444;">
              "The goal isn't to work harder. It's to build a protocol-level automated infrastructure where marginal cost approaches zero."
            </div>

            <p style="font-size: 16px;">Over the coming weeks, I’m going to unpack the exact JSON payloads, orchestration blueprints, and hard ROI accounting models we use to help lean teams achieve asymmetric leverage.</p>

            <p style="font-size: 16px;">To start building your foundation right now, explore our core command center at <a href="https://wenboom.com" style="color: #000; font-weight: bold; text-decoration: underline;">wenboom.com</a>—this is the exact protocol layer we rely on to cut operational overhead by 80%.</p>

            <p style="font-size: 16px; margin-top: 30px;">Hit reply and tell me: <strong>What is the single most expensive manual workflow currently draining your margin?</strong> (I personally read and reply to every single message).</p>

            <p style="font-size: 16px; margin-top: 40px;">To your leverage,</p>
            <p style="font-size: 16px; font-weight: bold; margin-top: 5px;">Alex, Chief Architect @ Alex Automation</p>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;" />
            <!-- 2. 退订文案已更新为引导回复退订 -->
            <p style="color: #888; font-size: 12px;">You are receiving this email because you subscribed at wenboom.com. Reply directly to this email if you'd like to unsubscribe or reach out to us!</p>
          </div>
        `,
      })
    ]);

    if (!contactRes.ok || (emailRes && 'error' in emailRes && emailRes.error)) {
      throw new Error('Failed to process subscription or send welcome email.');
    }

    return new Response(JSON.stringify({ status: 'success', message: 'Subscribed and elite welcome email sent!' }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err?.message || 'Server Error' }), { status: 500 });
  }
};
