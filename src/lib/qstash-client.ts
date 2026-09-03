// ============================================================
// QStash Client - Delayed task queue for human-like email replies
// ============================================================
import { verifySignature } from '@upstash/qstash';

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
}

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const QSTASH_PUBLISH_URL = 'https://qstash.upstash.io/v2/publish';
const WORKER_CALLBACK_URL = 'https://wenboom.com/api/worker/process-reply';
const EST_OFFSET_HOURS = -5; // Eastern Standard Time (UTC-5)
const DAY_START_HOUR = 7;    // EST 07:00
const NIGHT_START_HOUR = 22; // EST 22:00
const MIN_DELAY_SECONDS = 8 * 60;   // 8 minutes
const MAX_DELAY_SECONDS = 35 * 60;  // 35 minutes
const MORNING_SEND_START_MINUTE = 15;  // 08:15
const MORNING_SEND_END_MINUTE = 90;    // 09:30 (08:00 + 90min)

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

  const response = await fetch(`${QSTASH_PUBLISH_URL}/${WORKER_CALLBACK_URL}`, {
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
// Verify QStash webhook signature (called by worker)
//   Note: If verifySignature import fails, check @upstash/qstash version.
//   For v2.x: import { verifySignature } from '@upstash/qstash'
// ------------------------------------------------------------
export async function verifyQstashWebhook(signature: string, rawBody: string): Promise<boolean> {
  const currentKey = import.meta.env.QSTASH_CURRENT_SIGNING_KEY || process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = import.meta.env.QSTASH_NEXT_SIGNING_KEY || process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!signature || !currentKey) {
    console.warn('[qstash] Missing signature or current signing key');
    return false;
  }

  try {
    await verifySignature({
      signature,
      body: rawBody,
      currentSigningKey: currentKey,
      nextSigningKey: nextKey || currentKey,
    });
    return true;
  } catch (error: any) {
    console.error('[qstash] Signature verification failed:', error?.message || error);
    return false;
  }
}
