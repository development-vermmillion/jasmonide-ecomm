import { NextResponse } from "next/server";
import { batch } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import { SECRET_KEYS } from "@/lib/site-fields";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  const s = await getSession();
  if (s?.role !== "owner") return NextResponse.json({ ok: false, error: "Only the owner can change settings" }, { status: 403 });
  const b = await req.json();
  // blank secret fields mean "keep the saved secret"
  const keys = Object.keys(b).filter((k) => k in DEFAULT_SETTINGS && !(SECRET_KEYS.includes(k) && !String(b[k] ?? "").trim()));
  await batch(keys.map((k) => ({ sql: "insert into settings (key,value) values (?,?) on conflict(key) do update set value = excluded.value", args: [k, String(b[k] ?? "")] })));
  return NextResponse.json({ ok: true });
}
