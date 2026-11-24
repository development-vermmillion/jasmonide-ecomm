// Downloads the free sample photos (Unsplash licence) into ./uploads/samples so the demo looks
// real and works offline.  Run once on a computer with internet:   npm run samples
import fs from "node:fs";
import path from "node:path";

const quiet = process.argv.includes("--quiet");
const log = (...a) => { if (!quiet) console.log(...a); };
const src = fs.readFileSync("src/lib/samples.ts", "utf8");
const block = src.slice(src.indexOf("POOLS"), src.indexOf("function pick"));
const ids = [...new Set([...block.matchAll(/"([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]))];
const dir = path.join("uploads", "samples");
fs.mkdirSync(dir, { recursive: true });

let ok = 0;
for (const id of ids) {
  const file = path.join(dir, id + ".jpg");
  if (fs.existsSync(file) && fs.statSync(file).size > 5000) { ok++; continue; }
  try {
    const r = await fetch(`https://unsplash.com/photos/${id}/download?force=true&w=1200&q=80`, { redirect: "follow", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "Mozilla/5.0" } });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !type.startsWith("image/")) throw new Error(`HTTP ${r.status} ${type}`);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    ok++;
    log("✓", id);
  } catch (e) {
    log("✗", id, "—", e.message); if (e.name === "TimeoutError" || /fetch failed/.test(e.message)) break;
  }
}
log(`\n${ok}/${ids.length} photos ready in uploads/samples. Restart the server and refresh.`);
