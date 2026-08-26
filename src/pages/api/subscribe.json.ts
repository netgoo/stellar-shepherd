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

    // 1. 保存联系人到 Resend Audience
    const contactRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        unsubscribed: false,
      }),
    });

    // 2. 并行发送高格调的欢迎邮件
    const emailRes = await resend.emails.send({
      from: 'WENBOOM <onboarding@wenboom.com>',
      to: [email],
      subject: 'Welcome to WENBOOM! Your journey starts here',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #111;">Welcome to WENBOOM! 🎉</h2>
          <p>We are thrilled to have you on board. You've successfully subscribed to our community.</p>
          <p>Get ready for deep insights, exclusive updates, and valuable resources straight to your inbox.</p>
          <div style="margin: 30px 0;">
            <a href="https://wenboom.com" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit WENBOOM</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, just reply directly to this email—we read and reply to every message.</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">© WENBOOM. All rights reserved.</p>
        </div>
      `,
    });

    if (!contactRes.ok || emailRes.error) {
      throw new Error('Failed to process subscription or send welcome email.');
    }

    return new Response(JSON.stringify({ status: 'success', message: 'Subscribed and welcome email sent!' }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err?.message || 'Server Error' }), { status: 500 });
  }
};
