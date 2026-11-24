import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/customer-auth";
import { lookupGift, checkReferral } from "@/lib/wallet";
import { getSettings } from "@/lib/catalog";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";

/** Checks a gift card code or referral code at checkout (preview only — the order re-checks everything). */
export async function POST(req: Request) {
  if (!(await allow("wallet:" + clientIp(req), 40, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const s = await getSettings();
  if (b.kind === "gift") {
    if (s.giftcards_enabled !== "1") return NextResponse.json({ ok: false, message: "Gift cards are not accepted right now" });
    const g = await lookupGift(b.code);
    return NextResponse.json(g.ok ? { ok: true, balance: g.balance, code: g.card.code, message: g.message } : g);
  }
  if (b.kind === "referral") {
    const me = await getCustomer();
    const r = await checkReferral(b.code, { customerId: me?.id, email: b.email, phone: b.phone }, Number(b.goods) || 0);
    return NextResponse.json({ ok: r.ok, discount: r.discount, message: r.message });
  }
  return NextResponse.json({ ok: false, message: "Unknown request" }, { status: 400 });
}
