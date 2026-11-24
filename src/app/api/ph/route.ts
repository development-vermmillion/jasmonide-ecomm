import fs from "fs";
import path from "path";
import { samplePick, sampleKind } from "@/lib/samples";
import { artSvg } from "@/lib/art";

/** Your own brand photos (public/brand) are used first, matched to the product kind. */
const BRAND: Record<string, string[]> = {
  jar: ["lit-candle", "sculpture-face", "gift-flatlay", "pour-wax", "sculpture"],
  vessel: ["jasmonoide-set", "holder-short", "vase-flowers", "demould-tray"],
  pillar: ["holder-tall", "holder-short", "jasmonoide-set", "studio"],
  float: ["lit-candle", "studio", "vase-flowers"],
  gift: ["gift-flatlay", "lit-candle", "sculpture-face"],
  material: ["pour-jesmonite", "demould-tray", "pour-wax"],
  hero: ["studio", "gift-flatlay"],
  mood: ["studio", "sculpture", "lit-candle", "jasmonoide-set", "vase-flowers"],
};
function brandPick(label: string): string | null {
  const l = label.toLowerCase();
  const pool = /sculpt|girl|bust|face|figure/.test(l) ? ["sculpture"] : BRAND[sampleKind(label)] || BRAND.mood;
  const h = [...(l || "x")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const f = pool[h % pool.length];
  return fs.existsSync(path.join(process.cwd(), "public", "brand", f + ".jpg")) ? `/brand/${f}.jpg` : null;
}

/**
 * Placeholder images. If a real photo was downloaded (npm run samples) it is used;
 * otherwise a soft candle illustration is drawn, so every card always has an image.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const t = (u.searchParams.get("t") || "").slice(0, 80);
  const brand = brandPick(t);
  if (brand) return new Response(null, { status: 302, headers: { Location: brand, "Cache-Control": "no-cache" } });
  const id = samplePick(t);
  if (fs.existsSync(path.join(process.cwd(), "uploads", "samples", id + ".jpg")))
    return new Response(null, { status: 302, headers: { Location: `/uploads/samples/${id}.jpg`, "Cache-Control": "no-cache" } });
  const seed = [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11);
  // hue per product keeps neighbouring cards varied but soft
  const hue = ([20, 340, 160, 45, 280, 200][seed % 6]);
  return new Response(artSvg(sampleKind(t), hue, seed), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-cache" } });
}
