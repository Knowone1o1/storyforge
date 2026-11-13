// The one AI endpoint of the live site. The page sends a prompt and a tier
// ("default" or "quick"); this function calls Claude and returns the text.
// The API key lives only here, in the host's environment variables.
import Anthropic from "@anthropic-ai/sdk";

const MODELS = { default: "claude-opus-5-5", quick: "claude-haiku-5-5" };
const MAX_PROMPT_CHARS = 20000;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "bad_request" });

  // Only our own page may call this (stops other sites from using the key).
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) {
    return res.status(403).json({ code: "forbidden" });
  }

  const { prompt, tier } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ code: "bad_request" });
  }
  const quick = tier === "quick";

  try {
    const message = quick
      ? await client.messages.create({
          model: MODELS.quick,
          max_tokens: 2000,
          output_config: { effort: "low" },
          messages: [{ role: "user", content: prompt }],
        })
      : await client.beta.messages.create({
          model: MODELS.default,
          max_tokens: 8000,
          output_config: { effort: "low" }, // keeps scenes and pictures fast
          // If a safety check declines a request, the API retries on a fallback model.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          messages: [{ role: "user", content: prompt }],
        });

    if (message.stop_reason === "refusal") return res.status(422).json({ code: "refused" });
    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    return res.status(200).json({ text });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ code: "rate_limited" });
    if (err instanceof Anthropic.AuthenticationError) return res.status(500).json({ code: "no_key" });
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      return res.status(502).json({ code: "ai_error" });
    }
    console.error(err);
    return res.status(500).json({ code: "server_error" });
  }
}
