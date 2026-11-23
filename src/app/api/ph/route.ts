// Generates a soft placeholder image (SVG) so the demo works without any real photos.
export async function GET(req: Request) {
  const u = new URL(req.url);
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
