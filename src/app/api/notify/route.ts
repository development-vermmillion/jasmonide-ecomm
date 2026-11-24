import { NextResponse } from "next/server";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export async function POST(req: Request) {
  if (!(await allow("notify:" + clientIp(req), 10, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  if ((await getSettings()).notify_enabled !== "1") return NextResponse.json({ ok: false, error: "Alerts are disabled" }, { status: 403 });
  const b = await req.json();
  if (!String(b.email || "").trim() && !String(b.phone || "").trim()) return NextResponse.json({ ok: false, error: "Enter an email or phone number" }, { status: 400 });
  await run("insert into notify_requests (product_id, variant_id, email, phone) values (?,?,?,?)", [Number(b.product_id), b.variant_id ? Number(b.variant_id) : null, b.email || "", b.phone || ""]);
  return NextResponse.json({ ok: true });
}
