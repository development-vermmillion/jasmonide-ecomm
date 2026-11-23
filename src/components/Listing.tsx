import Link from "next/link";
import { getProducts, getCategories, getSettings } from "@/lib/catalog";
import ProductCardGrid from "./ProductCardGrid";
import { PRODUCT_TYPES } from "@/lib/util";

const PAGE = 12;
type Props = { title: string; eyebrow?: string; intro?: string; base: string; params: Record<string, string | undefined>; fixed?: { category?: string; type?: string; sale?: boolean } };

export default async function Listing({ title, eyebrow, intro, base, params, fixed = {} }: Props) {
  const [cats, s] = await Promise.all([getCategories(), getSettings()]);
  const category = fixed.category ?? params.category;
  const type = fixed.type ?? params.type;
  const sale = fixed.sale || params.sale === "1";
  const all = await getProducts({
    category, type, q: params.q, sale, sort: params.sort, inStock: params.stock === "1",
    minPrice: params.min ? Number(params.min) : undefined, maxPrice: params.max ? Number(params.max) : undefined,
  });
  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  const page = Math.min(pages, Math.max(1, Number(params.page) || 1));
  const products = all.slice((page - 1) * PAGE, page * PAGE);

  const qs = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const m = { ...params, page: undefined, ...o };
    for (const [k, v] of Object.entries(m)) if (v && !(fixed as any)[k]) u.set(k, v);
    const str = u.toString();
    return base + (str ? "?" + str : "");
  };
  const chip = (active: boolean) => `whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${active ? "border-plum bg-plum text-white" : "border-neutral-300 bg-white/70 hover:border-plum"}`;
  const hidden = Object.entries(params).filter(([k, v]) => v && !["min", "max", "page"].includes(k) && !(fixed as any)[k]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="h-serif mt-1 text-3xl sm:text-4xl">{title}</h1>
      {intro && <p className="mt-2 max-w-2xl text-neutral-600">{intro}</p>}

      <div className="mt-6 space-y-3 rounded-xl bg-lilac/50 p-3">
        {!fixed.category && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <Link href={qs({ category: undefined })} className={chip(!category)}>All</Link>
            {cats.map((c: any) => <Link key={c.id} href={qs({ category: c.slug })} className={chip(category === c.slug)}>{c.name}</Link>)}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!fixed.type && Object.entries(PRODUCT_TYPES).filter(([k]) => k !== "combo" || s.combos_enabled === "1").map(([k, l]) => (
            <Link key={k} href={qs({ type: type === k ? undefined : k })} className={chip(type === k)}>{l.split(" ")[0]}</Link>
          ))}
          <Link href={qs({ stock: params.stock === "1" ? undefined : "1" })} className={chip(params.stock === "1")}>In stock</Link>
          {!fixed.sale && s.sale_enabled === "1" && <Link href={qs({ sale: sale ? undefined : "1" })} className={chip(sale)}>On sale</Link>}
          <form action={base} className="ml-auto flex items-center gap-1.5 text-xs">
            {hidden.map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
            <input name="min" type="number" min="0" defaultValue={params.min} placeholder="₹ min" className="input !w-20 !py-1" />–
            <input name="max" type="number" min="0" defaultValue={params.max} placeholder="₹ max" className="input !w-20 !py-1" />
            <button className="btn !px-3 !py-1 text-xs">Go</button>
          </form>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-2 text-xs">
          <span className="text-neutral-600">{all.length} item{all.length === 1 ? "" : "s"}{params.q ? ` for “${params.q}”` : ""}</span>
          <div className="flex gap-1">
            {[["", "Newest"], ["price-asc", "Price ↑"], ["price-desc", "Price ↓"], ["name", "A–Z"]].map(([v, l]) => (
              <Link key={v} href={qs({ sort: v || undefined })} className={`rounded-full px-2.5 py-1 ${(params.sort || "") === v ? "bg-white font-semibold" : "text-neutral-600"}`}>{l}</Link>
            ))}
          </div>
        </div>
      </div>

      {products.length ? <ProductCardGrid products={products} /> : <p className="py-20 text-center text-neutral-500">No products found. Try changing your filters.</p>}

      {pages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && <Link href={qs({ page: String(page - 1) })} className={chip(false)}>← Prev</Link>}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={qs({ page: String(n) })} className={chip(n === page)}>{n}</Link>)}
          {page < pages && <Link href={qs({ page: String(page + 1) })} className={chip(false)}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
