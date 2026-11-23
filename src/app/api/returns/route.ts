import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { returnEligibility } from "@/lib/returns";

export async function POST(req: Request) {
  const s = await getSettings();
  if (s.returns_enabled !== "1") return NextResponse.json({ ok: false, error: "Returns are not being accepted right now" }, { status: 403 });
  const b = await req.json();
  if (b.token !== orderToken(String(b.number))) return NextResponse.json({ ok: false, error: "Invalid order link" }, { status: 403 });
  const o = await one("select * from orders where number = ?", [b.number]);
  if (!o) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  const ex = await one("select id from returns where order_id = ?", [o.id]);
  const el = returnEligibility(o, s, !!ex);
  if (!el.ok) return NextResponse.json({ ok: false, error: el.reason }, { status: 400 });
  if (!String(b.reason || "").trim()) return NextResponse.json({ ok: false, error: "Please choose a reason" }, { status: 400 });
  await run("insert into returns (order_id, reason, details, refund_amount) values (?,?,?,?)", [o.id, b.reason, String(b.details || "").slice(0, 1500), o.total]);
  return NextResponse.json({ ok: true });
}
