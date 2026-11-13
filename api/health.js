// Finds the ElevenLabs key whatever the setting was called (ELEVENLABS_API_KEY, ELEVENLABS, elevenlabs_key...).
const elevenKey = () => process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS || process.env.ELEVEN_LABS_API_KEY ||
  Object.entries(process.env).filter(([k, v]) => /eleven|xi_api/i.test(k) && !/voice|model/i.test(k) && v && v.trim().length > 20).map(([, v]) => v.trim())[0];
// Lets the page check that it is running on the live site (not inside Claude)
// and whether the AI key and the narrator (ElevenLabs) key have been set.
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    ai: Boolean(process.env.GEMINI_API_KEY || process.env.GEMINI),
    voice: Boolean(elevenKey()),
  });
}
