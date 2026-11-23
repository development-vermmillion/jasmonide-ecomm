"use client";
import Link from "next/link";
import { Plus, ArrowRight, Star } from "lucide-react";
import { useCart } from "./cart";
import { HeartButton } from "./wishlist";
import { inr } from "@/lib/util";

const TINTS = ["bg-blush", "bg-mint", "bg-sky", "bg-butter", "bg-lilac", "bg-peach"];

export default function ProductCard({ p }: { p: any }) {
  const { add } = useCart();
  const direct = p.type !== "variable";
  const out = !p.in_stock;
  return (
    <div className="pcard group flex w-[220px] shrink-0 snap-start flex-col sm:w-[250px]">
      <div className={`relative aspect-square overflow-hidden rounded-xl ${TINTS[p.id % 6]}`}>
        <Link href={`/product/${p.slug}`} className="block h-full w-full" aria-label={p.name}>
          <img src={p.imgs[0]} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
          {p.imgs[1] && <img src={p.imgs[1]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" loading="lazy" />}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
          {p.on_sale && <span className="badge bg-clay text-white">{p.discount_pct ? `−${p.discount_pct}%` : "Sale"}</span>}
          {p.badge && !p.on_sale && <span className="badge bg-plum text-white">{p.badge}</span>}
        </div>
        {p.flags?.wishlist && <HeartButton id={p.id} className="absolute right-2 top-2" />}
        {out && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-semibold uppercase tracking-widest text-ink dark:bg-black/50 dark:text-white">Sold out</div>}
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="eyebrow !text-[10px]">{p.category_name || (p.type === "combo" ? "Combo" : "")}</p>
        <Link href={`/product/${p.slug}`} className="mt-1 text-sm font-semibold leading-snug hover:underline">{p.name}</Link>
        {p.spec_line && <p className="mt-0.5 text-xs text-neutral-500">{p.spec_line}</p>}
        {p.flags?.reviews && p.review_count > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500"><Star size={12} className="fill-amber-500 text-amber-500" />{p.rating} <span>({p.review_count})</span></p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold">{p.from && <span className="mr-1 text-xs font-normal text-neutral-500">From</span>}{inr(p.display_price)}</span>
          {p.strike && <span className="text-xs text-neutral-400 line-through">{inr(p.strike)}</span>}
        </div>
        <div className="mt-3">
          {direct ? (
            <button disabled={out} onClick={() => add({ productId: p.id, variantId: null, name: p.name, variantName: "", price: p.display_price, image: p.imgs[0], slug: p.slug, max: Math.min(p.available, 99), type: p.type })} className="btn-outline w-full !py-2 text-xs">
              {out ? "Sold out" : <><Plus size={14} /> Quick add</>}
            </button>
          ) : (
            <Link href={`/product/${p.slug}`} className="btn-outline w-full !py-2 text-xs">{out ? "Sold out" : <>Choose & add <ArrowRight size={14} /></>}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
