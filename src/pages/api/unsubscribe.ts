import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';
import { verifyUnsubscribeToken } from '../../utils/unsubscribeToken';

export const prerender = false;

const normalizeEmail = (e: string) => e.trim().toLowerCase();

// 幂等退订：已退订/从未订阅的邮箱同样静默成功（防邮箱枚举）
async function markUnsubscribed(email: string): Promise<void> {
  const key = `subscriber:${email}`;
  const subscriber = await kv.get<Record<string, any>>(key);
  if (subscriber && subscriber.status !== 'unsubscribed') {
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = Date.now();
    await kv.set(key, subscriber);
  }
}

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') ?? '';
  const token = url.searchParams.get('token') ?? '';

  if (!email || !token) {
    return new Response('Missing email or token parameters.', { status: 400 });
  }
  if (!verifyUnsubscribeToken(email, token)) {
    return new Response('Invalid or expired unsubscribe token.', { status: 403 });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    await markUnsubscribed(normalizedEmail);
    return redirect(`/unsubscribe-success?email=${encodeURIComponent(normalizedEmail)}`, 302);
  } catch (error) {
    console.error('[Unsubscribe API Error]:', error);
    return new Response('Internal server error processing unsubscribe request.', { status: 500 });
  }
};

// RFC 8058 One-Click：Gmail/Yahoo 的 POST 请求，参数位于 List-Unsubscribe 头指向的 URL 中
export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') ?? '';
  const token = url.searchParams.get('token') ?? '';

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return new Response('Invalid token or parameters.', { status: 400 });
  }

  try {
    await markUnsubscribed(normalizeEmail(email));
    return new Response('Unsubscribed successfully', { status: 200 });
  } catch (error) {
    console.error('[One-Click Unsubscribe Error]:', error);
    return new Response('Internal error', { status: 500 });
  }
};
