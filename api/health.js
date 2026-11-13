// Lets the page check that it is running on the live site (not inside Claude)
// and whether the AI key has been set.
export default function handler(req, res) {
  res.status(200).json({ ok: true, ai: Boolean(process.env.GEMINI_API_KEY) });
}
