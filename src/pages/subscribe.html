import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('API Key Missing: RESEND_API_KEY is not defined in environment variables.');
      return new Response(JSON.stringify({ message: 'Server configuration error' }), { status: 500 });
    }

    const resendRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      console.error('Resend API Error:', resendRes.status, resData);
      return new Response(JSON.stringify({ status: 'error', detail: resData }), { status: 400 });
    }
  } catch (err) {
    console.error('Runtime Catch Error:', err);
    return new Response(JSON.stringify({ status: 'error' }), { status: 500 });
  }
};
