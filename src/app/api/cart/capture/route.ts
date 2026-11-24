import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { run } from "@/lib/db";

/** Remembers a cart once the shopper has typed a phone or email at checkout, so you can follow up if they don't finish. */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const session = String(b.session || "").slice(0, 60);
    const email = String(b.email || "").trim().toLowerCase().slice(0, 120), phone = String(b.phone || "").replace(/[^\d+]/g, "").slice(0, 16);
    if (!session || (!email && phone.replace(/\D/g, "").length < 10) || !Array.isArray(b.items) || !b.items.length) return NextResponse.json({ ok: false });
    let src = "direct";
    try { src = JSON.parse(decodeURIComponent(cookies().get("src")?.value || "{}")).source || "direct"; } catch {}
    const items = JSON.stringify(b.items.slice(0, 30).map((i: any) => ({ name: String(i.name || "").slice(0, 80), qty: Number(i.qty) || 1, price: Number(i.price) || 0 })));
    await run(`insert into abandoned_carts (session,name,email,phone,items,total,source) values (?,?,?,?,?,?,?)
      on conflict(session) do update set name=excluded.name, email=excluded.email, phone=excluded.phone, items=excluded.items, total=excluded.total, updated_at=datetime('now'), recovered=0`,
      [session, String(b.name || "").slice(0, 80), email, phone, items, Number(b.total) || 0, src]);
  } catch {}
  return NextResponse.json({ ok: true });
}
