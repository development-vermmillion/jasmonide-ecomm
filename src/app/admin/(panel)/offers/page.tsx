import Link from "next/link";
import { getProducts, getCategories } from "@/lib/catalog";
import OffersManager from "@/components/admin/OffersManager";
import { inr, fdate } from "@/lib/util";

export default async function Offers() {
  const [cats, products] = await Promise.all([getCategories(), getProducts({ includeDraft: true })]);
  const onSale = products.filter((p: any) => p.on_sale);
  const scheduled = products.filter((p: any) => !p.on_sale && (p.sale_price != null || p.variants.some((v: any) => v.sale_price != null)));
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Sales & offers</h1><p className="text-sm text-neutral-500">Run store-wide or category sales in a few clicks. Individual prices can also be set on each product. Coupon codes live under <Link href="/admin/coupons" className="underline">Coupons</Link>.</p></div>
      <OffersManager cats={cats.map((c: any) => ({ id: c.id, name: c.name }))} products={products.map((p: any) => ({ id: p.id, name: p.name }))} />
      <div className="card overflow-x-auto">
        <div className="p-5 pb-2"><h2 className="font-semibold">Live on the storefront now ({onSale.length})</h2></div>
        <table className="w-full min-w-[560px]"><tbody className="divide-y divide-neutral-100">
          {onSale.map((p: any) => (
            <tr key={p.id}><td className="td"><div className="flex items-center gap-3"><img src={p.imgs[0]} className="h-9 w-9 rounded object-cover" alt="" /><Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link></div></td>
              <td className="td">{inr(p.display_price)} <span className="text-xs text-neutral-400 line-through">{inr(p.strike)}</span></td>
              <td className="td"><span className="badge bg-clay-soft text-clay-dark">−{p.discount_pct}%</span></td>
              <td className="td text-xs text-neutral-500">{p.sale_start ? fdate(p.sale_start) : "now"} → {p.sale_end ? fdate(p.sale_end) : "no end"}</td></tr>
          ))}
          {!onSale.length && <tr><td className="py-10 text-center text-neutral-500">No active sales.</td></tr>}
        </tbody></table>
      </div>
      {scheduled.length > 0 && (
        <div className="card p-5"><h2 className="font-semibold">Scheduled / expired ({scheduled.length})</h2>
          <p className="mt-1 text-xs text-neutral-500">These have a sale price saved but it is outside its date window.</p>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">{scheduled.map((p: any) => <li key={p.id}><Link href={`/admin/products/${p.id}`} className="rounded-full border border-neutral-300 px-3 py-1 hover:border-plum">{p.name} · {p.sale_start ? fdate(p.sale_start) : ""} → {p.sale_end ? fdate(p.sale_end) : ""}</Link></li>)}</ul></div>
      )}
    </div>
  );
}
