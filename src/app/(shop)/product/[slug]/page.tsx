import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getProducts, getSettings } from "@/lib/catalog";
import ProductView from "@/components/ProductView";
import Rail from "@/components/Rail";
import Reveal from "@/components/Reveal";
import Stars from "@/components/Stars";
import Reviews from "@/components/Reviews";
import ReelsSection from "@/components/ReelsSection";
import RecentlyViewed from "@/components/RecentlyViewed";
import { inr } from "@/lib/util";
import { activeRules } from "@/lib/bulk";
import { ruleLabel } from "@/lib/bulk-label";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  return { title: p.seo_title || p.name, description: p.seo_desc || p.short_desc, openGraph: { title: p.seo_title || p.name, description: p.seo_desc || p.short_desc, images: [p.imgs[0]] } };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();
  const [s, related] = await Promise.all([getSettings(), getProducts({ category: p.category_slug, limit: 9 })]);
  const tiers = (await activeRules()).filter((r) => r.basis === "qty" && (r.scope === "all" || (r.scope === "category" && r.target_id === p.category_id) || (r.scope === "product" && r.target_id === p.id))).sort((a, b) => a.min_qty - b.min_qty);
  const rel = related.filter((r: any) => r.id !== p.id).slice(0, 8);
  const payments = [s.cod_enabled === "1" && p.type !== "digital" ? "Cash on delivery" : "", s.upi_enabled === "1" ? "UPI" : ""].filter(Boolean).join(" & ");
  const view = {
    id: p.id, slug: p.slug, name: p.name, type: p.type, imgs: p.imgs, on_sale: p.on_sale, discount_pct: p.discount_pct,
    display_price: p.display_price, strike: p.strike, from: p.from, available: p.available, low_stock: p.low_stock, track_stock: p.track_stock,
    sale_start: p.sale_start, sale_end: p.sale_end, flags: p.flags, salesOn: s.sale_enabled === "1", paymentNote: payments ? `${payments} available` : "",
    variants: p.variants.map((v: any) => ({ id: v.id, name: v.name, price: v.price, sale_price: v.sale_price, stock: v.stock })),
  };
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, image: p.imgs, description: p.short_desc || p.description?.slice(0, 200), sku: p.sku,
    offers: { "@type": "Offer", priceCurrency: "INR", price: p.display_price, availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    ...(p.review_count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.review_count } } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6">
        <Link href="/" className="hover:underline">Home</Link><ChevronRight size={12} className="mx-1 inline" /><Link href="/shop" className="hover:underline">Shop</Link>
        {p.category_name && <><ChevronRight size={12} className="mx-1 inline" /><Link href={`/category/${p.category_slug}`} className="hover:underline">{p.category_name}</Link></>}
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-6 sm:px-6 lg:grid-cols-2">
        <ProductView p={view} whatsapp={s.whatsapp}>
          <p className="eyebrow">{p.category_name || (p.type === "combo" ? "Combo" : "")}</p>
          <h1 className="h-serif mt-1 text-3xl sm:text-4xl">{p.name}</h1>
          {p.spec_line && <p className="mt-1 text-neutral-500">{p.spec_line}</p>}
          {p.flags.reviews && p.review_count > 0 && (
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm"><Stars value={p.rating} /><span className="text-neutral-500 underline">{p.rating} · {p.review_count} review{p.review_count === 1 ? "" : "s"}</span></a>
          )}
          {tiers.length > 0 && (
            <div className="mt-4 rounded-xl bg-mint/60 p-3 text-sm"><p className="font-semibold">Bulk savings</p><ul className="mt-1 space-y-0.5 text-neutral-700">{tiers.map((t) => <li key={t.id}>{ruleLabel(t)}</li>)}</ul></div>
          )}
        </ProductView>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {p.type === "combo" && p.items.length > 0 && (
          <Reveal>
            <section className="mb-8 rounded-xl bg-mint/60 p-5">
              <p className="eyebrow">What's in this combo</p>
              <ul className="mt-3 divide-y divide-neutral-200/60 text-sm">
                {p.items.map((i: any) => (
                  <li key={i.id} className="flex justify-between py-2"><span>{i.qty} × {i.p_name}{i.v_name ? ` — ${i.v_name}` : ""}</span><span className="text-neutral-500">{inr((i.v_price ?? i.p_price) * i.qty)}</span></li>
                ))}
              </ul>
              <p className="mt-3 text-right text-sm">Value {inr(p.combo_value)} · <b className="text-clay">You pay {inr(p.display_price)}</b></p>
            </section>
          </Reveal>
        )}
      </div>

      <ReelsSection productId={p.id} eyebrow="See it in action" title={`${p.name} in reels`} tone="bg-butter/50" compact />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <section className="max-w-3xl py-8">
            <p className="eyebrow">Description</p>
            <div className="mt-3 space-y-3 whitespace-pre-line text-[15px] leading-relaxed text-neutral-700">{p.description || p.short_desc}</div>
            {p.tags && <div className="mt-4 flex flex-wrap gap-2">{p.tags.split(",").filter(Boolean).map((t: string) => <Link key={t} href={`/shop?q=${t.trim()}`} className="rounded-full bg-lilac px-3 py-1 text-xs">#{t.trim()}</Link>)}</div>}
          </section>
        </Reveal>
      </div>

      <Reviews productId={p.id} />
      {s.recently_viewed_enabled === "1" && <RecentlyViewed id={p.id} />}
      <Rail tone="bg-sky/50" eyebrow="You may also like" title="More like this" products={rel} />
    </>
  );
}
