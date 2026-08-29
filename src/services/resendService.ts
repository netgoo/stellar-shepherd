import { Resend } from 'resend';
import { generateUnsubscribeToken } from '../utils/unsubscribeToken';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://wenboom.com';
const FROM_ADDRESS = process.env.MAIL_FROM || 'Alex @ Wenboom <alex@wenboom.com>';

export async function sendDripEmail(
  toEmail: string,
  emailConfig: { subject: string },
  htmlBody: string
) {
  const normalizedEmail = toEmail.trim().toLowerCase();
  const token = generateUnsubscribeToken(normalizedEmail);
  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

  const finalHtmlBody = htmlBody.replace(
    /\[Unsubscribe Here\]/g,
    `<a href="${unsubscribeUrl}" style="color:#888888;text-decoration:underline;">Unsubscribe Here</a>`
  );

  try {
    return await resend.emails.send({
      from: FROM_ADDRESS,
      to: normalizedEmail,
      subject: emailConfig.subject,
      html: finalHtmlBody,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  } catch (error) {
    console.error(`[Resend] Failed to send drip email to ${normalizedEmail}:`, error);
    throw error;
  }
}
