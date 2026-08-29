import crypto from 'node:crypto';

// 独立于 CRON_SECRET 的退订签名密钥；缺失时 fail-closed（宁可不发，不用弱密钥）
function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('[unsubscribeToken] UNSUBSCRIBE_SECRET is not configured (min 32 chars).');
  }
  return secret;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// 输出 32 位 hex（128bit 熵）
export function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(normalizeEmail(email))
    .digest('hex')
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  // 格式白名单：非 32 位 hex 直接拒绝，不做任何哈希运算（快速失败 + 固定长度比较）
  if (!email || !token || !/^[0-9a-f]{32}$/.test(token)) return false;

  const expected = generateUnsubscribeToken(email);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);

  // timingSafeEqual 要求等长，长度不同直接返回 false，避免抛异常与时序差异
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
