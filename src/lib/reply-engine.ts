// ============================================================
// Reply Engine - Core processing for inbound emails
// ============================================================
import { Resend } from 'resend';
import { kvStore } from './kvServer';
import { generateUnsubscribeToken } from '../utils/unsubscribeToken';
import {
  HUMAN_INTERVENTION_KEYWORDS,
  FORWARD_EMAILS,
  AFFILIATE_LINKS,
  FORWARD_SUBJECT_PREFIX,
  MAX_AFFILIATE_LINKS,
  DEDUP_TTL_SECONDS,
} from '../config/reply-config';
import { generateAIReply, getFallbackReply } from './groq-client';

interface InboundEmailData {
  id?: string;
  from: string;
  to?: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
}

interface ProcessResult {
  status: 'replied' | 'forwarded' | 'skipped';
  reason?: string;
  sender?: string;
}

function extractEmail(fromField: string): string {
  const match = fromField.match(/<([^>]+)>/);
  return match ? match[1].trim().toLowerCase() : fromField.trim().toLowerCase();
}

function getHeader(headers: Record<string, string> | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  const lowerName = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lowerName) {
      return headers[key];
    }
  }
  return undefined;
}

function extractEmailData(payload: any): InboundEmailData {
  if (payload?.data?.from) {
    return payload.data as InboundEmailData;
  }
  return payload as InboundEmailData;
}

function isAutomatedEmail(data: InboundEmailData): boolean {
  const sender = (data.from || '').toLowerCase();
  const subject = (data.subject || '').toLowerCase();
  const autoSubmitted = getHeader(data.headers, 'auto-submitted');
  const listId = getHeader(data.headers, 'list-id');
  const precedence = getHeader(data.headers, 'precedence');

  const automatedSenders = [
    'no-reply', 'noreply', 'no_reply', 'donotreply', 'do-not-reply',
    'mailer-daemon', 'mailerdaemon', 'postmaster', 'bounce', 'bounces',
    'automated', 'autoresponder', 'auto-responder', 'notification',
    'notifications', 'system', 'updates', 'newsletter',
  ];

  const automatedSubjects = [
    'out of office', 'away from office', 'auto-reply', 'automatic reply',
    'autoresponse', 'auto response', 'vacation', 'holiday',
    'delivery status', 'delivery failure', 'undeliverable', 'failed delivery',
    'mail delivery', 'returned mail', 'bounce',
  ];

  if (automatedSenders.some(s => sender.includes(s))) return true;
  if (automatedSubjects.some(s => subject.includes(s))) return true;
  if (autoSubmitted && autoSubmitted !== 'no') return true;
  if (listId) return true;
  if (precedence && ['bulk', 'list', 'junk'].includes(precedence.toLowerCase())) return true;

  return false;
}

function needsHumanIntervention(subject: string, body: string): boolean {
  const fullContent = `${subject} ${body}`.toLowerCase();
  return HUMAN_INTERVENTION_KEYWORDS.some(keyword =>
    fullContent.includes(keyword.toLowerCase())
  );
}

function selectAffiliateLinks(content: string): { name: string; url: string }[] {
  const lowerContent = content.toLowerCase();
  const scoredLinks = AFFILIATE_LINKS.map(link => {
    let score = 0;
    link.keywords.forEach(kw => {
      if (lowerContent.includes(kw.toLowerCase())) score += 1;
    });
    return { link, score };
  });

  const topLinks = scoredLinks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_AFFILIATE_LINKS)
    .map(item => ({ name: item.link.name, url: item.link.url }));

  if (topLinks.length === 0) {
    const makeLink = AFFILIATE_LINKS.find(l => l.name === 'Make.com');
    if (makeLink) {
      return [{ name: makeLink.name, url: makeLink.url }];
    }
  }

  return topLinks;
}

function getResend(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('[reply-engine] RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey.trim());
}

// ------------------------------------------------------------
// HTML rendering helpers (human-like email layout)
// ------------------------------------------------------------
function textToHtml(text: string): string {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>');
  const paragraphs = html.split(/\n\n+/).map(p =>
    `<p style="margin: 0 0 16px 0; line-height: 1.65;">${p.replace(/\n/g, '<br>')}</p>`
  ).join('');
  return paragraphs;
}

function hasAffiliateLink(text: string, links: { name: string; url: string }[]): boolean {
  return links.some(link => text.includes(link.url));
}

function buildPsAffiliateLinks(links: { name: string; url: string }[]): string {
  if (links.length === 0) return '';
  const linkText = links.map(l => `[${l.name}](${l.url})`).join(' and ');
  return `\n\nP.S. I've put together detailed benchmarks for ${linkText} on the site if you want to dig deeper.`;
}

// ------------------------------------------------------------
// Main processor
// ------------------------------------------------------------
export async function processInboundEmail(payload: any): Promise<ProcessResult> {
  const data = extractEmailData(payload);
  const senderField = data.from || '';
  const senderEmail = extractEmail(senderField);
  const subject = data.subject || 'No Subject';
  const bodyText = data.text || (data.html ? data.html.replace(/<[^>]*>?/gm, '') : '') || '';

  console.log(`[inbound] Processing email from: ${senderEmail}, subject: ${subject}`);

  if (isAutomatedEmail(data)) {
    console.log(`[inbound] Skipped: automated/system email from ${senderEmail}`);
    return { status: 'skipped', reason: 'automated-email' };
  }

  const emailId = data.id || `${senderEmail}-${subject}-${bodyText.substring(0, 100)}`;
  const dedupKey = `inbound:${Buffer.from(emailId).toString('hex').substring(0, 64)}`;
  try {
    const alreadyProcessed = await kvStore.get(dedupKey);
    if (alreadyProcessed) {
      console.log(`[inbound] Skipped: duplicate email (${dedupKey})`);
      return { status: 'skipped', reason: 'duplicate' };
    }
    await kvStore.set(dedupKey, { processedAt: Date.now(), sender: senderEmail }, { ex: DEDUP_TTL_SECONDS });
  } catch (dedupErr) {
    console.warn('[inbound] Dedup check failed, continuing:', dedupErr);
  }

  const resend = getResend();

  if (needsHumanIntervention(subject, bodyText)) {
    console.log(`[inbound] Human intervention needed, forwarding: ${senderEmail}`);
    await resend.emails.send({
      from: 'Alex (Inbound System) <alex@wenboom.com>',
      to: FORWARD_EMAILS,
      subject: `${FORWARD_SUBJECT_PREFIX} ${subject}`,
      replyTo: senderEmail,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
            <strong>ACTION REQUIRED:</strong> This email matched human-intervention keywords. Please review and reply manually.
          </div>
          <p><strong>Original Sender:</strong> ${senderField}</p>
          <p><strong>Reply-To:</strong> ${senderEmail}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
          <p><strong>Email Content:</strong></p>
          <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6;">${bodyText.substring(0, 5000)}</pre>
        </div>
      `,
    });
    return { status: 'forwarded', sender: senderEmail };
  }

  try {
    // Simulate human reply delay (5-8 seconds)
    const delayMs = 5000 + Math.floor(Math.random() * 3000);
    console.log(`[inbound] Simulating human reply delay: ${delayMs}ms`);
    await new Promise(resolve => setTimeout(resolve, delayMs));

    const matchedLinks = selectAffiliateLinks(`${subject} ${bodyText}`);
    console.log(`[inbound] Matched affiliate links: ${matchedLinks.map(l => l.name).join(', ')}`);

    let replyContent: string;
    try {
      replyContent = await generateAIReply(subject, bodyText, matchedLinks);
    } catch (aiErr) {
      console.warn('[inbound] AI generation failed, using fallback:', aiErr);
      replyContent = getFallbackReply(subject, bodyText);
    }

    // P.S. fallback: add affiliate links if AI didn't include them
    if (!hasAffiliateLink(replyContent, matchedLinks)) {
      replyContent += buildPsAffiliateLinks(matchedLinks);
      console.log('[inbound] Added P.S. affiliate links (AI did not include them)');
    }

    const unsubscribeToken = generateUnsubscribeToken(senderEmail);
    const unsubscribeUrl = `https://wenboom.com/api/unsubscribe?email=${encodeURIComponent(senderEmail)}&token=${unsubscribeToken}`;
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

    const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #1a1a1a; font-size: 15px;">
  ${textToHtml(replyContent)}
</div>`;

    await resend.emails.send({
      from: 'Alex @ Wenboom <alex@wenboom.com>',
      to: [senderEmail],
      subject: replySubject,
      replyTo: 'alex@wenboom.com',
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: htmlContent,
    });

    console.log(`[inbound] Auto-replied to: ${senderEmail}`);
    return { status: 'replied', sender: senderEmail };
  } catch (error: any) {
    console.error('[inbound] Auto-reply failed:', error?.message || error);
    try {
      await resend.emails.send({
        from: 'Alex (Inbound System) <alex@wenboom.com>',
        to: FORWARD_EMAILS,
        subject: `[AUTO-REPLY FAILED] ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <p><strong>Auto-reply failed for:</strong> ${senderField}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Error:</strong> ${error?.message || 'Unknown error'}</p>
            <p>Please reply manually.</p>
          </div>
        `,
      });
    } catch (forwardErr) {
      console.error('[inbound] Failure forward also failed:', forwardErr);
    }
    throw error;
  }
}
