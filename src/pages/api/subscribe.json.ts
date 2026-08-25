export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ status: 'error', message: 'API key not configured' }), { status: 500 });
    }

    const resendRes = await fetch('https://api.resend.com/contacts', {
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

    const resData = await resendRes.json();

    if (resendRes.ok) {
      return new Response(JSON.stringify({ status: 'success', data: resData }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ status: 'error', detail: resData }), { status: 400 });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err?.message || 'Server Error' }), { status: 500 });
  }
};
