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

const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36" };
const get = (url) => fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: UA });
const isImg = (r) => r.ok && (r.headers.get("content-type") || "").startsWith("image/");

async function download(id) {
  // Method 1: Unsplash's own download endpoint.
  try {
    const r = await get(`https://unsplash.com/photos/${id}/download?force=true&w=1200`);
    if (isImg(r)) return Buffer.from(await r.arrayBuffer());
  } catch {}
  // Method 2: read the photo page, find the direct image address, fetch a 1200px version.
  const page = await (await get(`https://unsplash.com/photos/${id}`)).text();
  const m = page.match(/https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9_-]+/);
  if (!m) throw new Error("photo page had no image link");
  const r = await get(`${m[0]}?auto=format&fit=max&w=1200&q=80`);
  if (!isImg(r)) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

let ok = 0, offline = 0;
for (const id of ids) {
  const file = path.join(dir, id + ".jpg");
  if (fs.existsSync(file) && fs.statSync(file).size > 5000) { ok++; continue; }
  try {
    const buf = await download(id);
    if (buf.length < 5000) throw new Error("file too small");
    fs.writeFileSync(file, buf);
    ok++;
    log("✓", id);
  } catch (e) {
    log("✗", id, "—", e.message);
    if (/fetch failed|timeout|ENOTFOUND|ECONN/i.test(e.message + e.name) && ++offline >= 2) { log("Looks like there is no internet access — stopping."); break; }
  }
}
log(`\n${ok}/${ids.length} photos ready in uploads/samples. Restart the server and refresh.`);
