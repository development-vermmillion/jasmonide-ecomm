import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { activeRules, computeBulk } from "@/lib/bulk";

export async function POST(req: Request) {
  const { items } = await req.json();
  const rules = await activeRules();
  if (!rules.length || !Array.isArray(items)) return NextResponse.json({ discount: 0, label: "", hint: "" });
  const lines = [];
  for (const it of items.slice(0, 50)) {
    const p = await one("select category_id from products where id = ?", [Number(it.productId)]);
    lines.push({ productId: Number(it.productId), categoryId: p?.category_id ?? null, price: Number(it.price) || 0, qty: Math.max(1, Number(it.qty) || 1) });
  }
  return NextResponse.json(computeBulk(rules, lines));
}
