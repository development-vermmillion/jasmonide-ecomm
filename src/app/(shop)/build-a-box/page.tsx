import { notFound } from "next/navigation";
import { getProducts, getSettings, unitPrice } from "@/lib/catalog";
import { run } from "@/lib/db";
import BoxBuilder from "@/components/BoxBuilder";

export const metadata = { title: "Build your gift box" };
export default async function Box() {
  const s = await getSettings();
  if (s.box_enabled !== "1") notFound();
  const slots = Math.max(2, Math.min(8, Number(s.box_slots) || 3)), disc = Math.max(0, Math.min(90, Number(s.box_discount) || 0));
  // the box discount is an ordinary coupon, so you can see/change it in Admin → Coupons
  if (disc > 0 && s.coupons_enabled === "1")
    await run("insert into coupons (code,type,value,min_order,active) values ('GIFTBOX','percent',?,0,1) on conflict(code) do update set value = excluded.value, active = 1", [disc]);
  const list = (await getProducts({ inStock: true })).filter((p: any) => !["digital", "combo"].includes(p.type) && !/material|casting/i.test(p.category_name || ""));
  const products = list.map((p: any) => ({
    id: p.id, name: p.name, slug: p.slug, image: p.imgs[0], type: p.type, cat: p.category_name,
    price: p.display_price, max: Math.min(p.available, 99),
    variants: p.type === "variable" ? p.variants.filter((v: any) => !p.track_stock || v.stock > 0).map((v: any) => ({ id: v.id, name: v.name, price: unitPrice({ ...v, sale_start: p.sale_start, sale_end: p.sale_end }), max: Math.min(p.track_stock ? v.stock : 99, 99) })) : [],
  })).filter((p: any) => p.type !== "variable" || p.variants.length);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center"><p className="eyebrow">Made for gifting</p><h1 className="h-serif mt-1 text-3xl sm:text-4xl">{s.box_title}</h1><p className="mx-auto mt-2 max-w-xl text-neutral-600">{s.box_intro}</p></div>
      <BoxBuilder products={products} slots={slots} discount={s.coupons_enabled === "1" ? disc : 0} note={s.box_note} />
    </div>
  );
}
