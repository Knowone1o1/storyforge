// Narrator for the live site: turns a page of text into speech with ElevenLabs
// and sends the audio back to the page. The key lives only in the host's settings.
const KEY = () => process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS || process.env.ELEVEN_LABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // a clear, warm premade voice
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
      body: JSON.stringify({ text, model_id: "eleven_flash_v2_5" }), // the fast model, for short waits
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
