// Narrator for the live site: turns a page of text into speech with ElevenLabs
// and sends the audio back to the page. The key lives only in the host's settings.
// Finds the ElevenLabs key whatever the setting was called (ELEVENLABS_API_KEY, ELEVENLABS, elevenlabs_key...).
const elevenKey = () => process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS || process.env.ELEVEN_LABS_API_KEY ||
  Object.entries(process.env).filter(([k, v]) => /eleven|xi_api/i.test(k) && !/voice|model/i.test(k) && v && v.trim().length > 20).map(([, v]) => v.trim())[0];
const KEY = elevenKey;
const VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // a clear, warm premade voice; set ELEVENLABS_VOICE_ID to change it
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2"; // the most natural reading voice; eleven_flash_v2_5 is faster and half the credits
const MAX_CHARS = 1200;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ code: "bad_request" });
  if (!KEY()) return res.status(501).json({ code: "no_voice" });

  // Only our own page may call this (stops other sites from spending the credits).
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) {
    return res.status(403).json({ code: "forbidden" });
  }

  const text = req.body && req.body.text;
  if (typeof text !== "string" || !text.trim() || text.length > MAX_CHARS) {
    return res.status(400).json({ code: "bad_request" });
  }

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": KEY(), "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true } }),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) {
      const detail = (await r.text().catch(() => "")).slice(0, 300);
      console.error("ElevenLabs error", r.status, detail);
      return res.status(502).json({ code: "voice_error", status: r.status, detail });
    }
    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(audio);
  } catch (err) {
    console.error("ElevenLabs call failed", err && err.message);
    return res.status(502).json({ code: "voice_error" });
  }
}
