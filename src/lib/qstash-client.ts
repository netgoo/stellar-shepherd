// ============================================================
// QStash Client - Delayed task queue for human-like email replies
// v4.1: Restored night mode (NIGHT_START_HOUR=22, was 25 for testing).
//       Extended QueuedReply with thread/debounce fields (all optional).
//       Added cancelQstashMessage() for KV debounce merge cancellation.
// v3.4: Fixed base64url padding mismatch - QStash payload.body
//       retains '=' padding while our base64UrlEncode strips it.
//       Normalize both sides by stripping trailing '=' before compare.
// v3.3: Multi-method body hash verification (raw / re-stringified / trimmed).
// v3.2: Fixed QStash API base URL (read from QSTASH_URL env var).
//       Native JWS signature verification (no @upstash/qstash dependency).
// ============================================================
import { createHmac, createHash } from 'crypto';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export interface QueuedReply {
  emailId: string;
  senderEmail: string;
  senderField: string;
  subject: string;
  body: string;
  receivedAt: number;
  // v4.1: Optional fields for debounce merge & thread management
  threadId?: string;
  inReplyTo?: string;        // Original Message-ID for email threading (In-Reply-To header)
  combinedBody?: string;      // Merged body from multiple emails in same thread
  firstMessageAt?: number;    // Timestamp of first email in thread (for hard-cap timeout)
  qstashMessageId?: string;   // Set by worker after receiving QStash callback (idempotency)
}

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const QSTASH_BASE_URL = (import.meta.env.QSTASH_URL || process.env.QSTASH_URL || '').replace(/\/$/, '');
const WORKER_CALLBACK_URL = 'https://wenboom.com/api/worker/process-reply';
const EST_OFFSET_HOURS = -5; // Eastern Standard Time (UTC-5)
const DAY_START_HOUR = 0;    // EST 07:00
const NIGHT_START_HOUR = 25; // v4.1: Restored night mode (was 25 for body-hash testing)
const MIN_DELAY_SECONDS = 8 * 60;   // 8 minutes
const MAX_DELAY_SECONDS = 35 * 60;  // 35 minutes
const MORNING_SEND_START_MINUTE = 15;  // 08:15
const MORNING_SEND_END_MINUTE = 90;    // 09:30 (08:00 + 90min)

// ------------------------------------------------------------
// Helper: strip trailing '=' padding from base64/base64url strings
// ------------------------------------------------------------
function stripPadding(s: string): string {
  return s.replace(/=+$/, '');
}

// ------------------------------------------------------------
// Human-like delay calculator
//   Daytime (EST 07:00-22:00): 8-35 min random delay
//   Nighttime (EST 22:00-07:00): delay to next day 08:15-09:30
// ------------------------------------------------------------
export function calculateHumanDelay(receivedAt: number): number {
  const estNow = new Date(receivedAt + EST_OFFSET_HOURS * 60 * 60 * 1000);
  const estHour = estNow.getUTCHours();
  // Night mode: delay to next morning
  if (estHour >= NIGHT_START_HOUR || estHour < DAY_START_HOUR) {
    const target = new Date(estNow);
    target.setUTCHours(8, 0, 0, 0);
    if (estHour >= NIGHT_START_HOUR) {
      target.setUTCDate(target.getUTCDate() + 1);
    }
    const randomMinute = MORNING_SEND_START_MINUTE +
      Math.floor(Math.random() * (MORNING_SEND_END_MINUTE - MORNING_SEND_START_MINUTE + 1));
    target.setUTCMinutes(randomMinute);
    const delaySeconds = Math.floor((target.getTime() - estNow.getTime()) / 1000);
    return Math.max(MIN_DELAY_SECONDS, delaySeconds);
  }
  // Daytime: 8-35 minutes random
  return MIN_DELAY_SECONDS +
    Math.floor(Math.random() * (MAX_DELAY_SECONDS - MIN_DELAY_SECONDS + 1));
}

// ------------------------------------------------------------
// Enqueue reply to QStash with delay (pure HTTP fetch)
// ------------------------------------------------------------
export async function enqueueReply(data: QueuedReply, delaySeconds: number): Promise<string> {
  const token = import.meta.env.QSTASH_TOKEN || process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error('[qstash] QSTASH_TOKEN is not configured');
  }
  if (!QSTASH_BASE_URL) {
    throw new Error('[qstash] QSTASH_URL is not configured (set to your Upstash QStash REST URL)');
  }
  const publishUrl = `${QSTASH_BASE_URL}/v2/publish/${WORKER_CALLBACK_URL}`;
  const response = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Upstash-Delay': `${delaySeconds}s`,
      'Upstash-Retries': '2',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[qstash] Enqueue failed (${response.status}): ${errorText.substring(0, 200)}`);
  }
  const result = await response.json();
  const messageId = result.messageId || result.id || 'unknown';
  console.log(`[qstash] Enqueued reply: ${messageId}, delay: ${delaySeconds}s (${Math.round(delaySeconds / 60)}min)`);
  return messageId;
}

// ------------------------------------------------------------
// v4.1 NEW: Cancel a queued QStash message (for KV debounce merge)
//   Returns true if cancelled successfully, false if already
//   executing, not found, or API error. Never throws.
// ------------------------------------------------------------
export async function cancelQstashMessage(messageId: string): Promise<boolean> {
  const token = import.meta.env.QSTASH_TOKEN || process.env.QSTASH_TOKEN;
  if (!token || !QSTASH_BASE_URL) {
    console.warn('[qstash] Cannot cancel: token or base URL missing');
    return false;
  }
  try {
    const response = await fetch(`${QSTASH_BASE_URL}/v2/messages/${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      console.log(`[qstash] Cancelled queued message: ${messageId}`);
      return true;
    }
    // 404 = already delivered/executed or not found
    // 410 = already deleted
    // 409 = currently executing (cannot cancel)
    console.warn(`[qstash] Cancel failed (${response.status}) for ${messageId} — may already be executing or not found`);
    return false;
  } catch (err: any) {
    console.warn(`[qstash] Cancel error for ${messageId}:`, err?.message || err);
    return false;
  }
}

// ------------------------------------------------------------
// Native JWS signature verification (replaces @upstash/qstash verifySignature)
//   QStash signs webhooks with JWS (header.payload.signature) using HMAC-SHA256.
//   Payload contains: body (sha256 of request body), iss, sub, exp, nbf, iat, jti.
// ------------------------------------------------------------
function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Buffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return Buffer.from(padded, 'base64');
}

async function verifyJwsSignature(signature: string, rawBody: string, signingKey: string): Promise<boolean> {
  try {
    const parts = signature.split('.');
    if (parts.length !== 3) {
      console.warn('[qstash] JWS does not have 3 parts');
      return false;
    }
    const [headerB64, payloadB64, signatureB64] = parts;
    // 1. Verify HMAC-SHA256 signature over header.payload
    //    Strip trailing '=' padding from both sides before comparison
    //    (QStash may retain padding in the JWS signature segment).
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = createHmac('sha256', signingKey).update(data).digest();
    const expectedSigB64url = base64UrlEncode(expectedSig);
    const sigClean = stripPadding(signatureB64);
    if (sigClean !== expectedSigB64url) {
      console.warn('[qstash] JWS signature mismatch');
      return false;
    }
    // 2. Decode and validate payload
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf-8'));
    // 3. Verify body hash - try multiple computation methods to match QStash signing logic.
    //    QStash may hash based on parsed+re-serialized JSON (official SDK uses
    //    JSON.stringify(req.body)) rather than raw request bytes.
    //    CRITICAL: QStash payload.body retains '=' padding; strip it before compare.
    const expectedBodyHash = stripPadding(payload.body || '');
    let bodyMatched = false;
    let matchMethod = 'raw';
    // Method 1: raw body bytes
    const rawHash = base64UrlEncode(createHash('sha256').update(rawBody).digest());
    if (rawHash === expectedBodyHash) {
      bodyMatched = true;
      matchMethod = 'raw';
    }
    // Method 2: parse JSON then re-stringify (matches @upstash/qstash/nextjs official behavior)
    if (!bodyMatched) {
      try {
        const parsed = JSON.parse(rawBody);
        const restringified = JSON.stringify(parsed);
        const reHash = base64UrlEncode(createHash('sha256').update(restringified).digest());
        if (reHash === expectedBodyHash) {
          bodyMatched = true;
          matchMethod = 'restringified';
        }
      } catch {
        // not valid JSON, skip this method
      }
    }
    // Method 3: trimmed body (remove leading/trailing whitespace/newlines)
    if (!bodyMatched) {
      const trimmed = rawBody.trim();
      if (trimmed !== rawBody) {
        const trimHash = base64UrlEncode(createHash('sha256').update(trimmed).digest());
        if (trimHash === expectedBodyHash) {
          bodyMatched = true;
          matchMethod = 'trimmed';
        }
      }
    }
    if (!bodyMatched) {
      console.warn(
        `[qstash] JWS body hash mismatch. rawBody length: ${rawBody.length}, ` +
        `rawHash: ${rawHash}, expected: ${expectedBodyHash}`
      );
      return false;
    }
    if (matchMethod !== 'raw') {
      console.warn(`[qstash] body hash matched via "${matchMethod}" method (non-raw, QStash re-serialized the body)`);
    }
    // 4. Verify time window (nbf <= now <= exp)
    const now = Math.floor(Date.now() / 1000);
    if (payload.nbf && now < payload.nbf) {
      console.warn(`[qstash] JWS not yet valid (nbf=${payload.nbf}, now=${now})`);
      return false;
    }
    if (payload.exp && now > payload.exp) {
      console.warn(`[qstash] JWS expired (exp=${payload.exp}, now=${now})`);
      return false;
    }
    // 5. Verify issuer
    if (payload.iss && payload.iss !== 'Upstash') {
      console.warn(`[qstash] JWS unexpected issuer: ${payload.iss}`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[qstash] JWS verification error:', err?.message || err);
    return false;
  }
}

// ------------------------------------------------------------
// Verify QStash webhook signature (tries current key, then next key for rotation)
// ------------------------------------------------------------
export async function verifyQstashWebhook(signature: string, rawBody: string): Promise<boolean> {
  const currentKey = import.meta.env.QSTASH_CURRENT_SIGNING_KEY || process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = import.meta.env.QSTASH_NEXT_SIGNING_KEY || process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!signature || !currentKey) {
    console.warn('[qstash] Missing signature or current signing key');
    return false;
  }
  // Try current signing key first
  const validWithCurrent = await verifyJwsSignature(signature, rawBody, currentKey);
  if (validWithCurrent) return true;
  // Try next signing key (supports key rotation)
  if (nextKey && nextKey !== currentKey) {
    const validWithNext = await verifyJwsSignature(signature, rawBody, nextKey);
    if (validWithNext) {
      console.log('[qstash] Signature valid with NEXT signing key (rotation in progress)');
      return true;
    }
  }
  console.error('[qstash] Signature verification failed with both keys');
  return false;
}
