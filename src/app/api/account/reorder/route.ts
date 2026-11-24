import { NextResponse } from "next/server";
import { all, one } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";
import { getProductById, unitPrice, getSettings } from "@/lib/catalog";

/** Current prices and stock for the items of one of the signed-in customer's past orders, ready to drop into the cart. */
export async function GET(req: Request) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ ok: false, error: "Please sign in" }, { status: 401 });
  const number = new URL(req.url).searchParams.get("number") || "";
  const o = await one("select id from orders where number = ? and customer_id = ?", [number, me.id]);
  if (!o) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  const s = await getSettings();
  const rows = await all("select product_id, variant_id, qty from order_items where order_id = ?", [o.id]);
  const items: any[] = [], skipped: string[] = [];
  for (const r of rows) {
    const p: any = await getProductById(r.product_id);
    if (!p || p.status !== "published" || (p.type === "combo" && s.combos_enabled !== "1")) { skipped.push(p?.name || "An item"); continue; }
    let price = unitPrice(p), vname = "", avail = p.available, vid: number | null = null;
    if (p.type === "variable") {
      const v = p.variants.find((x: any) => x.id === r.variant_id);
      if (!v) { skipped.push(p.name); continue; }
      price = unitPrice({ ...v, sale_start: p.sale_start, sale_end: p.sale_end }); vname = v.name; vid = v.id; avail = p.track_stock ? v.stock : 999999;
    }
    if (avail <= 0) { skipped.push(p.name); continue; }
    items.push({ productId: p.id, variantId: vid, name: p.name, variantName: vname, price, image: p.imgs[0], slug: p.slug, max: Math.min(avail, 99), type: p.type, qty: Math.min(r.qty, avail) });
  }
  return NextResponse.json({ ok: true, items, skipped });
}
