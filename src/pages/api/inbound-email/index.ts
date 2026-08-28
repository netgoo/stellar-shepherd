export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    if (body.type === 'email.received') {
      const emailData = body.data;
      const rawSender = emailData.from || '';

      const emailMatch = rawSender.match(/<([^>]+)>/) || [null, rawSender];
      const targetEmail = (emailMatch[1] || rawSender).trim().toLowerCase();

      if (targetEmail.includes('alex@wenboom.com')) {
        return new Response(JSON.stringify({ status: 'ignored_self_reply' }), { status: 200 });
      }

      let cleanSubject = (emailData.subject || 'Your message').trim();
      cleanSubject = cleanSubject.replace(/^(Re:\s*|RE:\s*|回复:\s*)+/gi, '').trim();

      const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
      if (apiKey && targetEmail) {
        const resend = new Resend(apiKey.trim());
        await resend.emails.send({
          from: 'Alex Automation <alex@wenboom.com>',
          to: [targetEmail],
          subject: cleanSubject,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111; max-width: 600px; padding: 20px;">
              <p>Hey,</p>
              <p>Thanks for reaching out. I have received your message regarding:</p>
              <blockquote style="border-left: 3px solid #ccc; margin: 10px 0; padding-left: 10px; color: #555;">
                "${cleanSubject}"
              </blockquote>
              <p>I personally go through every incoming message to identify opportunities for optimization and automation against manual bottlenecks.</p>
              <p>I’m reviewing your input now and will follow up with a custom-tailored breakdown within 1-2 business days.</p>
              <br />
              <p>Best regards,<br /><strong>Alex</strong><br/>Chief Architect @ Alex Automation</p>
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
