import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { getSettings, getProductById, unitPrice } from "@/lib/catalog";
import { orderToken } from "@/lib/token";

/** Items for a refill link from a reminder, plus the REFILL discount coupon (created on demand). */
export async function GET(req: Request) {
  const u = new URL(req.url), id = Number(u.searchParams.get("id"));
  if (u.searchParams.get("t") !== orderToken("sub" + id)) return NextResponse.json({ ok: false, error: "Invalid link" }, { status: 403 });
  const s = await getSettings();
  const sub = await one("select * from subscriptions where id = ?", [id]);
  if (!sub) return NextResponse.json({ ok: false, error: "Plan not found" }, { status: 404 });
  const p: any = await getProductById(sub.product_id);
  if (!p || p.status !== "published") return NextResponse.json({ ok: false, error: "This product isn't available right now" });
  let price = unitPrice(p), vname = "", vid: number | null = null, avail = p.available;
  if (p.type === "variable") {
    const v = p.variants.find((x: any) => x.id === sub.variant_id);
    if (!v) return NextResponse.json({ ok: false, error: "This option isn't available any more" });
    price = unitPrice({ ...v, sale_start: p.sale_start, sale_end: p.sale_end }); vname = v.name; vid = v.id; avail = p.track_stock ? v.stock : 999999;
  }
  if (avail <= 0) return NextResponse.json({ ok: false, error: "Sorry, this is sold out right now. We'll remind you again soon." });
  const pct = Math.max(0, Math.min(90, Number(s.subs_discount) || 0));
  if (pct > 0) await run("insert into coupons (code, type, value, min_order, active) values ('REFILL','percent',?,0,1) on conflict(code) do update set value = excluded.value, active = 1", [pct]);
  return NextResponse.json({ ok: true, coupon: pct > 0 ? "REFILL" : "", item: { productId: p.id, variantId: vid, name: p.name, variantName: vname, price, image: p.imgs[0], slug: p.slug, max: Math.min(avail, 99), type: p.type, qty: Math.min(sub.qty, avail) } });
}
