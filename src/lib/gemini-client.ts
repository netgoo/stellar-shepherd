// ============================================================
// Gemini API Client - Generate email replies with context
// ============================================================
import { AI_SYSTEM_PROMPT, MAX_EMAIL_BODY_LENGTH } from '../config/reply-config';

interface MatchedLink {
  name: string;
  url: string;
}

// Strip quoted reply history (e.g., "> On Mon, Jan 1 wrote:")
function stripReplyHistory(text: string): string {
  const lines = text.split('\n');
  const cleanLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Stop at common reply markers
    if (
      trimmed.startsWith('>') ||
      trimmed.startsWith('On ') && trimmed.includes('wrote:') ||
      trimmed.startsWith('在 ') && trimmed.includes('写道：') ||
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
  const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('[gemini] GEMINI_API_KEY is not configured');
  }

  // Clean and truncate email body
  const cleanBody = stripReplyHistory(userBody);
  const truncatedBody = cleanBody.length > MAX_EMAIL_BODY_LENGTH
    ? cleanBody.substring(0, MAX_EMAIL_BODY_LENGTH) + '\n\n[...truncated...]'
    : cleanBody;

  // Build links context for natural embedding
  let linksContext = '';
  if (matchedLinks.length > 0) {
    linksContext = `\n\n[RECOMMENDED TOOLS TO MENTION IF RELEVANT]:\n` +
      matchedLinks.map(l => `- ${l.name}: ${l.url}`).join('\n');
  }

  const promptText = `Subject: ${userSubject}

Email Body:
${truncatedBody}
${linksContext}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: AI_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[gemini] API error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText || replyText.trim().length === 0) {
      throw new Error('[gemini] Empty response from API');
    }

    return replyText.trim();

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('[gemini] Request timed out after 30s');
    }
    console.error('[gemini] Generation failed:', error?.message || error);
    throw error;
  }
}

// Fallback reply when AI generation fails (ensures no email goes unanswered)
export function getFallbackReply(userSubject: string, userBody: string): string {
  const cleanBody = stripReplyHistory(userBody).substring(0, 200);

  return `Hey,

Thanks for reaching out and for your thoughtful message about "${userSubject}".

I appreciate you taking the time to share this. Your perspective is valuable, and I'm glad to hear from readers who are actually building and deploying these systems.

I'd love to dive deeper into this. Could you share a bit more about your current setup and what specific challenge you're trying to solve? That way I can give you a more targeted recommendation.

In the meantime, you might find the blueprints at wenboom.com useful — each one includes raw JSON payloads and workflow exports you can import directly.

To your leverage,
Alex
Principal AI Infrastructure Architect | Wenboom.com`;
}
