export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { kvStore } from '../../../lib/kvServer';
import { generateUnsubscribeToken } from '../../../utils/unsubscribeToken';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email is required' }), { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase();
    const unsubscribeToken = generateUnsubscribeToken(cleanEmail);
    const unsubscribeUrl = `https://wenboom.com/api/unsubscribe?email=${encodeURIComponent(cleanEmail)}&token=${unsubscribeToken}`;
    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey.trim());
      try {
        const response = await resend.audiences.list();
        const audienceList = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];
        const targetAudienceId = audienceList[0]?.id;
        if (targetAudienceId) {
          await resend.contacts.create({
            email: cleanEmail,
            unsubscribed: false,
            audienceId: targetAudienceId,
          });
        } else {
          await resend.contacts.create({
            email: cleanEmail,
            unsubscribed: false,
          });
        }
      } catch (contactError) {
        console.error('Contact creation failed:', contactError);
      }
      await resend.emails.send({
        from: 'Alex @ Wenboom <alex@wenboom.com>',
        to: [cleanEmail],
        subject: 'Welcome to Wenboom: 7 tools, 4 pillars, zero glue',
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        html: `
          <div style="font-family: sans-serif; line-height: 1.65; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
            <p>Hey,</p>
            <p>Welcome to <strong>Wenboom</strong> — a production-grade AI infrastructure hub for lean B2B teams. If you are reading this, you are likely tired of brittle middleware setups, unmonitored webhooks, and SaaS seat fees that scale with your execution volume.</p>
            <p>Wenboom is not a news outlet or a generic tutorial farm. It is an engineering repository built around a strict <strong>4-pillar architecture</strong>:</p>
            <ul style="margin: 12px 0; padding-left: 20px;">
              <li><strong>Pillar 01 — Data Waterfall &amp; Outbound:</strong> Clay + Smartlead. Multi-provider enrichment with zero-drop deliverability.</li>
              <li><strong>Pillar 02 — Orchestration &amp; Cost Control:</strong> Make + n8n. Visual DAG agility with self-hosted determinism.</li>
              <li><strong>Pillar 03 — Agentic Voice &amp; Real-Time Flow:</strong> Voiceflow + Bland.ai. Sub-800ms voice AI pipeline orchestration.</li>
              <li><strong>Pillar 04 — Lifecycle Revenue CRM:</strong> ActiveCampaign. Closed-loop attribution from cold outreach to retention.</li>
            </ul>
            <p>Every blueprint published here is stress-tested in live deployment before release. No paid sponsorships, no paid reviews — editorial and technical independence is non-negotiable.</p>
            <p>To start exploring, visit the <a href="https://wenboom.com/trends" style="color: #0066cc; text-decoration: underline;">Blueprint &amp; Failure Protocol library</a> or the <a href="https://wenboom.com/tools" style="color: #0066cc; text-decoration: underline;">7-core stack breakdown</a>.</p>
            <p><strong>Hit reply and tell me:</strong> What is the single most expensive or brittle workflow in your current stack? I personally read every reply.</p>
            <p>To your leverage,<br />
            <strong>Alex</strong><br />
            Principal AI Infrastructure Architect | Wenboom.com</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 28px 0 14px 0;" />
            <p style="font-size: 0.8rem; color: #888; line-height: 1.5; margin: 0;">
              You are receiving this because you subscribed at wenboom.com.<br />
              <a href="${unsubscribeUrl}" style="color: #888; text-decoration: underline;">Unsubscribe</a> from Wenboom emails.
            </p>
          </div>
        `,
      });
      await kvStore.set(`sub:${cleanEmail}`, {
        subscribedAt: Date.now(),
        sentDripIds: []
      });
    }
    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (error: any) {
    console.error('subscribe error', error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
};
