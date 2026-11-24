import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { scoreProduct } from "@/lib/mood";

export async function POST(req: Request) {
  const { picks } = await req.json();
  const p: number[] = Array.isArray(picks) ? picks.map((x: any) => Number(x) || 0) : [];
  const all = (await getProducts({ inStock: true })).filter((x: any) => x.type !== "digital");
  const top = all.map((x: any) => ({ x, s: scoreProduct(x, p) + (x.featured ? 1 : 0) })).sort((a, b) => b.s - a.s).slice(0, 3);
  return NextResponse.json({ ok: true, items: top.map(({ x }) => ({ id: x.id, name: x.name, slug: x.slug, image: x.imgs[0], price: x.display_price, strike: x.strike, spec: x.spec_line || x.short_desc })) });
}
