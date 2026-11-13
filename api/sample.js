// The one AI endpoint of the live site. The page sends a prompt and a tier
// ("default" or "quick"); this function calls Google Gemini (free tier) and
// returns the text. The API key lives only here, in the host's environment variables.

// Free-tier limits are small, so each tier has a list: if one model is out of
// free requests (or unavailable) the next one is tried.
// Flash = better stories and pictures, but only about 20 free requests a day.
// Flash-Lite = about 500 free requests a day.
const MODELS = {
  default: ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  quick: ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
};
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MAX_PROMPT_CHARS = 20000;

async function callGemini(model, prompt, withConfig) {
  const body = { model, input: prompt };
  if (withConfig) body.generation_config = { thinking_level: "low" }; // keeps answers fast
  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(50000),
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

function textOf(data) {
  return (data.steps || [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "bad_request" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ code: "no_key" });

  // Only our own page may call this (stops other sites from using the key).
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) {
    return res.status(403).json({ code: "forbidden" });
  }

  const { prompt, tier } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ code: "bad_request" });
  }

  let sawRateLimit = false;
  for (const model of MODELS[tier === "quick" ? "quick" : "default"]) {
    try {
      let { status, data } = await callGemini(model, prompt, true);
      // Some models may not accept the speed setting: try once without it.
      if (status === 400) ({ status, data } = await callGemini(model, prompt, false));

      if (status === 200) {
        const text = textOf(data);
        if (text) return res.status(200).json({ text });
        console.error("Gemini returned no text", model, data.status);
        continue;
      }
      if (status === 401 || status === 403) {
        console.error("Gemini key rejected", status, data.error && data.error.message);
        return res.status(500).json({ code: "no_key" });
      }
      if (status === 429) sawRateLimit = true;
      console.error("Gemini error", model, status, data.error && data.error.message);
    } catch (err) {
      console.error("Gemini call failed", model, err && err.message);
    }
  }
  return sawRateLimit
    ? res.status(429).json({ code: "rate_limited" })
    : res.status(502).json({ code: "ai_error" });
}
