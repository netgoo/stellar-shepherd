// ============================================================
// Groq API Client - Generate email replies with Llama 3.1
// ============================================================
import { AI_SYSTEM_PROMPT, MAX_EMAIL_BODY_LENGTH } from '../config/reply-config';

interface MatchedLink {
  name: string;
  url: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

function stripReplyHistory(text: string): string {
  const lines = text.split('\n');
  const cleanLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('>') ||
      (trimmed.startsWith('On ') && trimmed.includes('wrote:')) ||
      (trimmed.startsWith('At ') && trimmed.includes('wrote:')) ||
      trimmed === '---' ||
      trimmed.startsWith('From:') ||
      trimmed.startsWith('Sent:') ||
      trimmed.startsWith('To:') ||
      trimmed.startsWith('Subject:')
    ) {
      break;
    }
    cleanLines.push(line);
  }
  return cleanLines.join('\n').trim();
}

export async function generateAIReply(
  userSubject: string,
  userBody: string,
  matchedLinks: MatchedLink[]
): Promise<string> {
  const apiKey = import.meta.env.GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('[groq] GROQ_API_KEY is not configured');
  }

  const cleanBody = stripReplyHistory(userBody);
  const truncatedBody = cleanBody.length > MAX_EMAIL_BODY_LENGTH
    ? cleanBody.substring(0, MAX_EMAIL_BODY_LENGTH) + '\n\n[...truncated...]'
    : cleanBody;

  let linksContext = '';
  if (matchedLinks.length > 0) {
    linksContext = `\n\n[RECOMMENDED TOOLS TO MENTION IF RELEVANT]:\n` +
      matchedLinks.map(l => `- ${l.name}: ${l.url}`).join('\n');
  }

  const userMessage = `Subject: ${userSubject}\n\nEmail Body:\n${truncatedBody}\n${linksContext}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[groq] API error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content;

    if (!replyText || replyText.trim().length === 0) {
      throw new Error('[groq] Empty response from API');
    }

    return replyText.trim();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('[groq] Request timed out after 30s');
    }
    console.error('[groq] Generation failed:', error?.message || error);
    throw error;
  }
}

export function getFallbackReply(userSubject: string, userBody: string): string {
  return `Hey,
Thanks for reaching out and for your thoughtful message about "${userSubject}".
I appreciate you taking the time to share this. Your perspective is valuable, and I am glad to hear from readers who are actually building and deploying these systems.
I would love to dive deeper into this. Could you share a bit more about your current setup and what specific challenge you are trying to solve? That way I can give you a more targeted recommendation.
In the meantime, you might find the blueprints at wenboom.com useful - each one includes raw JSON payloads and workflow exports you can import directly.
To your leverage,
Alex
Principal AI Infrastructure Architect | Wenboom.com`;
}
