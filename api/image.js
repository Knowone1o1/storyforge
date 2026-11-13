// Illustrator for the live site: paints one picture-book page and sends the image back.
// It tries Google's image models on the site's Gemini key first (best quality) and falls
// back to Pollinations (free, no key) if Gemini refuses. GET so browsers and Vercel can cache it.
const KEY = () => process.env.GEMINI_API_KEY || process.env.GEMINI;
const GEMINI_MODELS = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image", "gemini-nano-banana-2.1"];
const STYLE = "Children's picture-book illustration, hand-painted gouache with visible textured brush strokes, warm dark-brown outlines, rich saturated colours, soft warm light, cheerful and gentle. No text, no letters, no words, no numbers, no signs, no border, no watermark.";
let deadModels = new Set(); // models that refused this key, skipped until the server restarts

function findImage(data){ // the image can sit in a few places depending on the API revision
  if (!data || typeof data !== "object") return null;
  if (data.output_image && data.output_image.data) return {b64: data.output_image.data, type: data.output_image.mime_type};
  for (const step of data.steps || []) for (const part of step.content || []) {
    if (part && part.type === "image" && part.data) return {b64: part.data, type: part.mime_type};
  }
  for (const c of data.candidates || []) for (const part of ((c.content || {}).parts || [])) {
    const d = part.inlineData || part.inline_data; if (d && d.data) return {b64: d.data, type: d.mimeType || d.mime_type};
  }
  return null;
}
async function viaGemini(prompt, notes){
  if (!KEY()) { notes.push("gemini: no key"); return null; }
  for (const model of GEMINI_MODELS) {
    if (deadModels.has(model)) continue;
    try {
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json", "x-goog-api-key": KEY()},
        body: JSON.stringify({model, input: [{type: "text", text: prompt}]}),
        signal: AbortSignal.timeout(40000),
      });
      const data = await r.json().catch(() => ({}));
      const img = r.ok ? findImage(data) : null;
      if (img) return {buf: Buffer.from(img.b64, "base64"), type: img.type || "image/png", by: model};
      notes.push(`${model}: ${r.status} ${String((data.error && data.error.message) || "no image").slice(0, 160)}`);
      if (r.status === 400 || r.status === 403 || r.status === 404 || r.status === 429) deadModels.add(model);
    } catch (e) { notes.push(`${model}: ${e && e.message}`); }
  }
  return null;
}
async function viaPollinations(prompt, seed, notes){
  try {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 1500))}?width=768&height=768&seed=${seed}&nologo=true&model=flux`;
    const r = await fetch(url, {signal: AbortSignal.timeout(45000)});
    if (!r.ok) { notes.push(`pollinations: ${r.status}`); return null; }
    return {buf: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") || "image/jpeg", by: "pollinations"};
  } catch (e) { notes.push(`pollinations: ${e && e.message}`); return null; }
}

export default async function handler(req, res) {
  const q = req.query || {};
  const scene = String(q.p || "").trim().slice(0, 1200);
  const seed = Math.abs(parseInt(q.s, 10) || 7) % 1000000;
  if (!scene) return res.status(400).json({code: "bad_request"});
  const prompt = `${STYLE}\n${scene}`;
  const notes = [];
  const img = (q.via !== "free" && await viaGemini(prompt, notes)) || await viaPollinations(prompt, seed, notes);
  if (!img) { console.error("image failed", notes.join(" | ")); return res.status(502).json({code: "image_error", notes}); }
  res.setHeader("Content-Type", img.type);
  res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable"); // same page, same picture
  res.setHeader("X-Painted-By", img.by);
  if (notes.length) res.setHeader("X-Notes", notes.join(" | ").slice(0, 900).replace(/[^\x20-\x7e]/g, "?"));
  return res.status(200).send(img.buf);
}
