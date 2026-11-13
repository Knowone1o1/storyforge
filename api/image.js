// Illustrator for the live site: paints one picture-book page and sends the image back.
// It tries Google's image models on the site's Gemini key first (best quality) and falls
// back to Pollinations (free, no key) if Gemini refuses. GET so browsers and Vercel can cache it.
const KEY = () => process.env.GEMINI_API_KEY || process.env.GEMINI;
const GEMINI_MODELS = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image", "gemini-nano-banana-2.1"];
const STYLE = "Soft gouache painting for young children, cute friendly cartoon characters with round faces, warm bright colours, gentle storybook lighting, detailed background. No text, no letters.";
// The same style words used for the Figma paintings in the ready-made books and library covers, so Gemini matches them.
const BOOK_STYLE = "Children's picture-book illustration, hand-painted gouache with visible textured brush strokes, warm dark-brown outlines, rich saturated colours, soft golden light, cheerful and gentle, expressive cartoon faces with big eyes and rosy cheeks, detailed lush background. Square format. No text, no letters, no numbers, no borders, no watermark.";
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
async function askGemini(model, input, notes, label){
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {"Content-Type": "application/json", "x-goog-api-key": KEY()},
    body: JSON.stringify({model, input}),
    signal: AbortSignal.timeout(40000),
  });
  const data = await r.json().catch(() => ({}));
  const img = r.ok ? findImage(data) : null;
  if (img) return {img: {buf: Buffer.from(img.b64, "base64"), type: img.type || "image/png", by: model + label}};
  notes.push(`${model}${label}: ${r.status} ${String((data.error && (data.error.message || data.error.status)) || data.message || JSON.stringify(data).slice(0, 220)).slice(0, 220)}`);
  return {status: r.status};
}
// ref: the book's cover, so the characters look the same on every page. If a model refuses the picture input,
// the same model is asked again without it.
async function viaGemini(prompt, notes, ref){
  if (!KEY()) { notes.push("gemini: no key"); return null; }
  for (const model of GEMINI_MODELS) {
    if (deadModels.has(model)) continue;
    try {
      if (ref) {
        const a = await askGemini(model, [{type: "text", text: `${prompt}\nThe attached picture is this book's cover. Draw the same characters looking exactly the same as on it (same face, skin colour, hair, clothes and colours) and in the same painting style, but in the new scene above. Do not copy the cover's layout or any title text.`},
          {type: "image", data: ref.b64, mime_type: ref.type}], notes, "+cover");
        if (a.img) return a.img;
      }
      const b = await askGemini(model, [{type: "text", text: prompt}], notes, "");
      if (b.img) return b.img;
      if (b.status === 400 || b.status === 404) deadModels.add(model); // 402 and 429 can clear once billing or quota catches up, so those are retried
    } catch (e) { notes.push(`${model}: ${e && e.message}`); }
  }
  return null;
}
async function coverFor(req, r, notes){ // fetch the cover (already painted and cached) from this same site
  if (!r || !r.startsWith("/api/image?") || /[?&]r=/.test(r)) return null;
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const res = await fetch(`https://${host}${r}`, {signal: AbortSignal.timeout(45000)});
    if (!res.ok) { notes.push(`cover: ${res.status}`); return null; }
    return {b64: Buffer.from(await res.arrayBuffer()).toString("base64"), type: (res.headers.get("content-type") || "image/png").split(";")[0]};
  } catch (e) { notes.push(`cover: ${e && e.message}`); return null; }
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
  const scene = String(q.p || "").trim().slice(0, 1400);
  const seed = Math.abs(parseInt(q.s, 10) || 7) % 1000000;
  if (!scene) return res.status(400).json({code: "bad_request"});
  const prompt = `${scene} ${STYLE}`; // the scene first, so the painter draws what happens
  const notes = [];
  const ref = q.via !== "free" ? await coverFor(req, String(q.r || ""), notes) : null;
  const img = (q.via !== "free" && await viaGemini(`${BOOK_STYLE}\nScene: ${scene}`, notes, ref)) || await viaPollinations(prompt, seed, notes);
  if (!img) { console.error("image failed", notes.join(" | ")); return res.status(502).json({code: "image_error", notes}); }
  res.setHeader("Content-Type", img.type);
  res.setHeader("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable"); // same page, same picture
  res.setHeader("X-Painted-By", img.by);
  if (notes.length) res.setHeader("X-Notes", notes.join(" | ").slice(0, 900).replace(/[^\x20-\x7e]/g, "?"));
  return res.status(200).send(img.buf);
}
