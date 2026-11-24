import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { all, batch, one, run } from "@/lib/db";
import { allow, clientIp } from "@/lib/ratelimit";

const TYPES = new Set(["view", "product", "click", "scroll", "time", "atc", "wish", "unwish", "search", "checkout", "pclick", "cclick", "pincode", "quiz", "box"]);
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;
const clean = (v: any, n = 80) => String(v ?? "").replace(/[<>]/g, "").slice(0, n);
const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : null);

export async function POST(req: Request) {
  try {
    if (BOT.test(req.headers.get("user-agent") || "") || cookies().get("admin_session")?.value) return NextResponse.json({ ok: true });
    if (!(await allow("ins:" + clientIp(req), 600, 3600))) return NextResponse.json({ ok: true });
    const b = await req.json();
    const evs = (Array.isArray(b.events) ? b.events : []).slice(0, 40).filter((e: any) => TYPES.has(e?.type));
    if (!evs.length) return NextResponse.json({ ok: true });
    const device = b.device === "mobile" ? "mobile" : "desktop", session = clean(b.sid, 20);
    const now = Date.now(), day = new Date(now).toISOString().slice(0, 10);
    const stmts: { sql: string; args: any[] }[] = [];
    for (const e of evs) {
      let pid = num(e.product_id), cid: number | null = null, label = clean(e.label, 60);
      if (e.type === "pclick" && label) { const p = await one("select id from products where slug = ?", [label]); if (p) { pid = p.id; } else continue; }
      if (e.type === "cclick" && label) { const c = await one("select id from categories where slug = ?", [label]); if (c) cid = c.id; else continue; }
      if (pid) { const p = await one("select category_id from products where id = ?", [pid]); if (!p) continue; cid = p.category_id ?? null; }
      stmts.push({
        sql: "insert into events (day, ts, type, session, path, product_id, category_id, label, x, y, ph, device, val) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        args: [day, now, e.type, session, clean(e.path, 120), pid, cid, label, e.type === "click" ? num(e.x) : null, e.type === "click" ? num(e.y) : null, e.type === "click" ? num(e.ph) : null, device, num(e.val)],
      });
    }
    if (stmts.length) await batch(stmts);
    if (Math.random() < 0.01) await run("delete from events where day < date('now','-120 day')");
  } catch {}
  return NextResponse.json({ ok: true });
}
