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
  AffiliateLink,
} from '../config/reply-config';
import { generateAIReply, getFallbackReply } from './gemini-client';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

// Extract pure email from "Name <email@example.com>" format
function extractEmail(fromField: string): string {
  const match = fromField.match(/<([^>]+)>/);
  return match ? match[1].trim().toLowerCase() : fromField.trim().toLowerCase();
}

// Case-insensitive header lookup
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

// Resend webhook payload may be { type, data: {...} } or direct {...}
function extractEmailData(payload: any): InboundEmailData {
  if (payload?.data?.from) {
    return payload.data as InboundEmailData;
  }
  return payload as InboundEmailData;
}

// Check if this is an automated/system email (prevent loops)
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

  // Check sender
  if (automatedSenders.some(s => sender.includes(s))) return true;

  // Check subject
  if (automatedSubjects.some(s => subject.includes(s))) return true;

  // Check headers
  if (autoSubmitted && autoSubmitted !== 'no') return true;
  if (listId) return true; // Mailing list, don't reply
  if (precedence && ['bulk', 'list', 'junk'].includes(precedence.toLowerCase())) return true;

  return false;
}

// Check if email needs human intervention
function needsHumanIntervention(subject: string, body: string): boolean {
  const fullContent = `${subject} ${body}`.toLowerCase();
  return HUMAN_INTERVENTION_KEYWORDS.some(keyword =>
    fullContent.includes(keyword.toLowerCase())
  );
}

// Select best-matching affiliate links by keyword score
function selectAffiliateLinks(content: string): { name: string; url: string }[] {
  const lowerContent = content.toLowerCase();

  const scoredLinks = AFFILIATE_LINKS.map(link => {
    let score = 0;
    link.keywords.forEach(kw => {
      if (lowerContent.includes(kw.toLowerCase())) score += 1;
    });
    return { link, score };
  });

  // Filter scored > 0, sort desc, take top N
  const topLinks = scoredLinks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_AFFILIATE_LINKS)
    .map(item => ({ name: item.link.name, url: item.link.url }));

  // If no match, recommend Make.com (most universally useful)
  if (topLinks.length === 0) {
    const makeLink = AFFILIATE_LINKS.find(l => l.name === 'Make.com');
    if (makeLink) {
      return [{ name: makeLink.name, url: makeLink.url }];
    }
  }

  return topLinks;
}

// Get Resend instance (lazy init with validation)
function getResend(): Resend {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('[reply-engine] RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey.trim());
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

  // 1. Skip automated/system emails (loop prevention)
  if (isAutomatedEmail(data)) {
    console.log(`[inbound] Skipped: automated/system email from ${senderEmail}`);
    return { status: 'skipped', reason: 'automated-email' };
  }

  // 2. Deduplication (prevent duplicate replies from webhook retries)
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

  // 3. Human intervention check
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
            <strong>⚠️ ACTION REQUIRED:</strong> This email matched human-intervention keywords. Please review and reply manually.
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

  // 4. Auto-reply path
  try {
    // Select affiliate links based on content
    const matchedLinks = selectAffiliateLinks(`${subject} ${bodyText}`);
    console.log(`[inbound] Matched affiliate links: ${matchedLinks.map(l => l.name).join(', ')}`);

    // Generate AI reply (with fallback)
    let replyContent: string;
    try {
      replyContent = await generateAIReply(subject, bodyText, matchedLinks);
    } catch (aiErr) {
      console.warn('[inbound] AI generation failed, using fallback:', aiErr);
      replyContent = getFallbackReply(subject, bodyText);
    }

    // Generate unsubscribe URL for this sender
    const unsubscribeToken = generateUnsubscribeToken(senderEmail);
    const unsubscribeUrl = `https://wenboom.com/api/unsubscribe?email=${encodeURIComponent(senderEmail)}&token=${unsubscribeToken}`;

    // Send reply
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

    await resend.emails.send({
      from: 'Alex | Wenboom <alex@wenboom.com>',
      to: [senderEmail],
      subject: replySubject,
      replyTo: 'alex@wenboom.com',
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      text: replyContent,
    });

    console.log(`[inbound] Auto-replied to: ${senderEmail}`);
    return { status: 'replied', sender: senderEmail };

  } catch (error: any) {
    console.error('[inbound] Auto-reply failed:', error?.message || error);
    // On failure, forward to human for manual handling
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
