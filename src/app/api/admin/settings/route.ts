import { NextResponse } from "next/server";
import { batch } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import { SECRET_KEYS, HOME, LEGAL, MARKETING, ASSISTANT } from "@/lib/site-fields";
import { canEditContent } from "@/lib/roles";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  const s = await getSession();
  const owner = s?.role === "owner";
  if (!owner && !canEditContent(s?.role)) return NextResponse.json({ ok: false, error: "Only the owner can change settings" }, { status: 403 });
  const b = await req.json();
  if (!owner) { // content roles may only change content (homepage, legal text, marketing) — not keys, payments or integrations
    const ok = new Set([...HOME, ...LEGAL, ...MARKETING, ...ASSISTANT].flatMap((g) => g.fields.map((f) => f.key)).filter((k) => !SECRET_KEYS.includes(k) && !["ga_id", "meta_pixel_id"].includes(k)));
    for (const k of Object.keys(b)) if (!ok.has(k)) delete b[k];
  }
  // blank secret fields mean "keep the saved secret"
  const keys = Object.keys(b).filter((k) => k in DEFAULT_SETTINGS && !(SECRET_KEYS.includes(k) && !String(b[k] ?? "").trim()));
  await batch(keys.map((k) => ({ sql: "insert into settings (key,value) values (?,?) on conflict(key) do update set value = excluded.value", args: [k, String(b[k] ?? "")] })));
  return NextResponse.json({ ok: true });
}
