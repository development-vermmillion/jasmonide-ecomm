import { NextResponse } from "next/server";
import { getProducts, getSettings } from "@/lib/catalog";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (q.length < 2 || (await getSettings()).search_enabled !== "1") return NextResponse.json([]);
  const list = await getProducts({ q, limit: 6 });
  return NextResponse.json(list.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, image: p.imgs[0], price: p.display_price, category: p.category_name || "" })));
}
