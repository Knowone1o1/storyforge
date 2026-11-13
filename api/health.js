// Lets the page check that it is running on the live site (not inside Claude)
// and whether the AI key and the narrator (ElevenLabs) key have been set.
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    ai: Boolean(process.env.GEMINI_API_KEY || process.env.GEMINI),
    voice: Boolean(process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS || process.env.ELEVEN_LABS_API_KEY),
  });
}
