import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }

    //   Resend API  
    const resendRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        unsubscribed: false,
      }),
    });

    if (resendRes.ok) {
      return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ status: 'error' }), { status: 400 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error' }), { status: 500 });
  }
};
