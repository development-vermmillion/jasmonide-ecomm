import fs from "fs";
import path from "path";
import { samplePhoto, samplePick } from "@/lib/samples";

// Placeholder images: redirects to a free sample photo. Add &svg=1 for the drawn fallback.
export async function GET(req: Request) {
  const u = new URL(req.url);
  if (u.searchParams.get("svg") !== "1") {
    // Prefer a locally downloaded copy (run `npm run samples`) — fast, offline, no hotlinking.
    const id = samplePick(u.searchParams.get("t") || "");
    if (fs.existsSync(path.join(process.cwd(), "uploads", "samples", id + ".jpg")))
      return new Response(null, { status: 302, headers: { Location: `/uploads/samples/${id}.jpg`, "Cache-Control": "public, max-age=3600" } });
    const w = Math.min(1600, Math.max(200, Number(u.searchParams.get("w") || 900)));
    return new Response(null, { status: 302, headers: { Location: samplePhoto(u.searchParams.get("t") || "", w), "Cache-Control": "public, max-age=3600" } });
  }
  const t = (u.searchParams.get("t") || "").slice(0, 40);
  const h = Number(u.searchParams.get("h") || 30) % 360;
  const esc = (s: string) => s.replace(/[<>&"]/g, "");
  const words = esc(t).split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 16) { lines.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  const text = lines.slice(0, 3).map((l, i) => `<text x="400" y="${380 + i * 44}" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="hsl(${h},25%,28%)" opacity=".8">${l}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},60%,90%)"/><stop offset="1" stop-color="hsl(${(h + 35) % 360},55%,82%)"/></linearGradient></defs>
<rect width="800" height="800" fill="url(#g)"/>
<circle cx="400" cy="260" r="92" fill="hsl(${h},50%,74%)" opacity=".55"/><circle cx="470" cy="215" r="46" fill="#fff" opacity=".35"/>
${text}
<text x="400" y="740" text-anchor="middle" font-family="sans-serif" font-size="16" letter-spacing="6" fill="hsl(${h},20%,40%)" opacity=".6">PLACEHOLDER IMAGE</text></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}
