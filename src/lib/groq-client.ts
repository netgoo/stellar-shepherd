// ============================================================
// v4.1 NEW: Flexible low-level generation with custom system prompt
// Used by reply-engine v4.1 for intent-specific prompts.
// ============================================================
export async function generateWithPrompt(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.6,
  maxTokens: number = 800,
): Promise<string> {
  const apiKey = import.meta.env.GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('[groq] GROQ_API_KEY is not configured');
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REPLY_TIMEOUT_MS);
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
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
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('[groq] Request timed out');
    }
    console.error('[groq] generateWithPrompt failed:', error?.message || error);
    throw error;
  }
}
