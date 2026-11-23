import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

// Used by the wishlist and "recently viewed" widgets: /api/products?ids=1,2,3
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").map(Number).filter((n) => n > 0).slice(0, 24);
  if (!ids.length) return NextResponse.json([]);
  const list = await getProducts({ ids });
  const order = new Map(ids.map((id, i) => [id, i]));
  list.sort((a: any, b: any) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return NextResponse.json(list.map(({ description, items, ...p }: any) => p));
}
