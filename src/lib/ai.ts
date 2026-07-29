// AI wrapper — backed by Google Gemini's free tier instead of the paid
// Anthropic API. Function names (askClaude / askClaudeForJSON) are kept the
// same on purpose so nothing else in the app (interview route, etc.) needs
// to change — only this file knows which provider is actually being used.

const MODEL_CANDIDATES = ['gemini-flash-latest', 'gemini-flash-lite-latest'];

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(model, system, userPrompt, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your .env file.');
  }

  const res = await fetch(`${geminiUrl(model)}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${system}\n\n${userPrompt}` }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    const err = new Error(`Gemini API error (${res.status}): ${errBody}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? '';
}

export async function askClaude(system, userPrompt, maxTokens = 1024) {
  let lastError;

  for (const model of MODEL_CANDIDATES) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await callGemini(model, system, userPrompt, maxTokens);
      } catch (err) {
        lastError = err;
        const status = err?.status;
        const isOverloaded = status === 503 || status === 429;

        if (isOverloaded && attempt < maxAttempts) {
          await sleep(attempt * 1500);
          continue;
        }
        break;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini API failed after retries');
}

export async function askClaudeForJSON(system, userPrompt, maxTokens = 1024) {
  const jsonSystem = `${system}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown code fences, no preamble, no explanation — just the raw JSON object. Every newline inside a string value MUST be escaped as \\n and every double-quote inside a string value MUST be escaped as \\". Keep any code or long text values concise so the full JSON fits within the token limit.`;
  const raw = await askClaude(jsonSystem, userPrompt, maxTokens);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}