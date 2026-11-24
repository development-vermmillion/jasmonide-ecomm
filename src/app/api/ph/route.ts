import fs from "fs";
import path from "path";
import { samplePick, sampleKind } from "@/lib/samples";
import { artSvg } from "@/lib/art";

/**
 * Placeholder images. If a real photo was downloaded (npm run samples) it is used;
 * otherwise a soft candle illustration is drawn, so every card always has an image.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const t = (u.searchParams.get("t") || "").slice(0, 80);
  const id = samplePick(t);
  if (fs.existsSync(path.join(process.cwd(), "uploads", "samples", id + ".jpg")))
    return new Response(null, { status: 302, headers: { Location: `/uploads/samples/${id}.jpg`, "Cache-Control": "public, max-age=600" } });
  const seed = [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11);
  // hue per product keeps neighbouring cards varied but soft
  const hue = ([20, 340, 160, 45, 280, 200][seed % 6]);
  return new Response(artSvg(sampleKind(t), hue, seed), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
}
