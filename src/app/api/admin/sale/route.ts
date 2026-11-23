import { NextResponse } from "next/server";
import { all, run } from "@/lib/db";

/** Bulk sale tool: apply % off to a category / selected products (and their variants), with optional schedule — or clear sales. */
export async function POST(req: Request) {
  const { action, percent, categoryId, ids, start, end } = await req.json();
  let products: any[];
  if (ids?.length) products = await all(`select id, type, price from products where id in (${ids.map(() => "?").join(",")})`, ids);
  else if (categoryId) products = await all("select id, type, price from products where category_id = ?", [Number(categoryId)]);
  else products = await all("select id, type, price from products");
  products = products.filter((p) => p.type !== "combo" || true);

  if (action === "clear") {
    for (const p of products) {
      await run("update products set sale_price=null, sale_start=null, sale_end=null where id = ?", [p.id]);
      await run("update variants set sale_price=null where product_id = ?", [p.id]);
    }
    return NextResponse.json({ ok: true, count: products.length });
  }
  const pct = Number(percent);
  if (!(pct > 0 && pct < 100)) return NextResponse.json({ ok: false, error: "Enter a discount between 1 and 99" }, { status: 400 });
  for (const p of products) {
    const sale = Math.round(p.price * (1 - pct / 100));
    await run("update products set sale_price=?, sale_start=?, sale_end=? where id = ?", [sale, start || null, end || null, p.id]);
    await run("update variants set sale_price = round(price * ?) where product_id = ?", [1 - pct / 100, p.id]);
  }
  return NextResponse.json({ ok: true, count: products.length });
}
