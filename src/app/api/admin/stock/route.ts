import { NextResponse } from "next/server";
import { moveStock, setStock } from "@/lib/orders";

export async function POST(req: Request) {
  const { productId, variantId, mode, value, reason } = await req.json();
  const n = Math.floor(Number(value));
  if (isNaN(n)) return NextResponse.json({ ok: false, error: "Enter a number" }, { status: 400 });
  if (mode === "set") await setStock(Number(productId), variantId ? Number(variantId) : null, Math.max(0, n), reason || "Manual stock count");
  else await moveStock(Number(productId), variantId ? Number(variantId) : null, n, reason || (n >= 0 ? "Stock received" : "Stock removed"));
  return NextResponse.json({ ok: true });
}
