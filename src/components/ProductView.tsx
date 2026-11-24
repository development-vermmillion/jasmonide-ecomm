"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap, XCircle, AlertTriangle, Download, CheckCircle2, Truck, Banknote, Headset, Share2, Check } from "lucide-react";
import { useCart } from "./cart";
import TrackEvent from "./TrackEvent";
import { HeartButton } from "./wishlist";
import NotifyForm from "./NotifyForm";
import { WhatsAppIcon } from "./social";
import { inr } from "@/lib/util";

const TINTS = ["bg-blush", "bg-mint", "bg-sky", "bg-butter", "bg-lilac", "bg-peach"];

function saleOn(o: any, p: any) {
  if (o.sale_price == null || o.sale_price >= o.price) return false;
  const s = p.sale_start ? new Date(p.sale_start).getTime() : NaN, e = p.sale_end ? new Date(p.sale_end).getTime() : NaN;
  if (!isNaN(s) && Date.now() < s) return false;
  if (!isNaN(e) && Date.now() > e + 86399000) return false;
  return true;
}

export default function ProductView({ p, whatsapp, waOrder, shipNote, children }: { p: any; whatsapp: string; waOrder?: { text: string; store: string } | null; shipNote?: string; children: React.ReactNode }) {
  const { add } = useCart();
  const router = useRouter();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [vid, setVid] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const cta = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState(false);
  useEffect(() => {
    const el = cta.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setStick(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => { document.body.classList.toggle("has-sticky-bar", stick); return () => document.body.classList.remove("has-sticky-bar"); }, [stick]);
  const v = p.variants.find((x: any) => x.id === vid);

  const info = useMemo(() => {
    if (p.type === "variable" && v) {
      const on = p.salesOn && saleOn(v, p);
      return { price: on ? v.sale_price : v.price, strike: on ? v.price : null, avail: p.track_stock ? Math.max(0, v.stock) : 999999, on };
    }
    return { price: p.display_price, strike: p.strike, avail: p.available, on: p.on_sale };
  }, [p, v]);

  const needVariant = p.type === "variable" && !v;
  const out = p.type === "variable" ? (v ? info.avail <= 0 : p.available <= 0) : p.available <= 0;
  const max = Math.min(info.avail, 99);

  const addNow = (go: boolean) => {
    if (needVariant) return setErr("Please choose an option");
    setErr("");
    add({ productId: p.id, variantId: v?.id ?? null, name: p.name, variantName: v?.name ?? "", price: info.price, image: p.imgs[0], slug: p.slug, max, type: p.type }, qty);
    if (go) router.push("/checkout");
  };
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } } catch {}
  };

  return (
    <>
      <TrackEvent event="view_item" id={String(p.id)} value={p.display_price || p.price || 0} items={[{ id: p.id, name: p.name, price: p.display_price || p.price || 0 }]} />
      <div>
        <div className={`relative aspect-square overflow-hidden rounded-2xl ${TINTS[p.id % 6]}`}>
          <img key={img} src={p.imgs[img]} alt={p.name} className="h-full w-full animate-[fadeIn_.4s_ease] object-cover" />
          {p.on_sale && <span className="badge absolute left-3 top-3 bg-clay text-sm text-white">{p.discount_pct ? `−${p.discount_pct}%` : "Sale"}</span>}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            {p.flags.wishlist && <HeartButton id={p.id} />}
            <button onClick={share} aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 dark:bg-black/40">{copied ? <Check size={17} className="text-green-600" /> : <Share2 size={17} />}</button>
          </div>
        </div>
        {p.imgs.length > 1 && (
          <div className="mt-3 flex gap-3">
            {p.imgs.map((s: string, i: number) => (
              <button key={i} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition ${i === img ? "border-plum" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <img src={s} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      {stick && !out && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-neutral-200 bg-paper/95 px-4 py-2.5 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
          <div className="min-w-0 flex-1"><p className="truncate text-xs text-neutral-500">{p.name}</p><p className="text-base font-semibold">{inr(info.price)}</p></div>
          <button className="btn" onClick={() => (needVariant ? window.scrollTo({ top: (cta.current?.offsetTop || 0) - 200, behavior: "smooth" }) : addNow(false))}>{needVariant ? "Choose option" : <><ShoppingBag size={16} /> Add to bag</>}</button>
        </div>
      )}
      <div>
        {children}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold">{p.type === "variable" && !v && p.from && <span className="mr-1 text-sm font-normal text-neutral-500">From</span>}{inr(info.price)}</span>
          {info.strike && <span className="text-neutral-400 line-through">{inr(info.strike)}</span>}
          {info.on && info.strike && <span className="badge bg-clay-soft text-clay-dark">Save {inr(info.strike - info.price)}</span>}
        </div>
        <p className="mt-1 text-xs text-neutral-500">Inclusive of taxes where applicable.</p>

        {p.type === "variable" && (
          <div className="mt-6">
            <p className="label">Choose option</p>
            <div className="flex flex-wrap gap-2">
              {p.variants.map((x: any) => {
                const o = p.track_stock && x.stock <= 0;
                return (
                  <button key={x.id} onClick={() => { setVid(x.id); setErr(""); setQty(1); }}
                    className={`rounded-lg border px-4 py-2 text-sm transition ${vid === x.id ? "border-plum bg-plum text-white" : "border-neutral-300 hover:border-plum"} ${o ? "opacity-40 line-through" : ""}`}>
                    {x.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-5 text-sm">
          {out ? <span className="inline-flex items-center gap-1.5 text-red-600"><XCircle size={15} />Out of stock</span>
            : p.flags.counter && p.track_stock && info.avail <= (p.low_stock || 5) && info.avail < 999999 ? <span className="inline-flex items-center gap-1.5 text-clay-dark"><AlertTriangle size={15} />Only {info.avail} left — order soon</span>
            : p.type === "digital" ? <span className="inline-flex items-center gap-1.5 text-green-700"><Download size={15} />Instant digital delivery</span>
            : <span className="inline-flex items-center gap-1.5 text-green-700"><CheckCircle2 size={15} />In stock</span>}
        </p>

        {out && p.flags.notify ? <NotifyForm productId={p.id} variantId={v?.id ?? null} /> : (
          <div ref={cta} className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-neutral-300">
              <button className="px-4 py-2" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={15} /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="px-4 py-2" aria-label="Increase" onClick={() => setQty((q) => Math.min(max, q + 1))}><Plus size={15} /></button>
            </div>
            <button className="btn flex-1" disabled={out} onClick={() => addNow(false)}>{out ? "Sold out" : <><ShoppingBag size={16} /> Add to bag</>}</button>
            <button className="btn-clay w-full sm:w-auto" disabled={out} onClick={() => addNow(true)}><Zap size={16} /> Buy now</button>
          </div>
        )}
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

        {waOrder && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waOrder.text.replace("{store}", waOrder.store).replace("{product}", p.name).replace("{link}", typeof window !== "undefined" ? location.href : ""))}`} target="_blank" className="btn-outline mt-3 w-full"><WhatsAppIcon size={16} className="text-[#25D366]" /> Order on WhatsApp</a>}
        {shipNote && <p className="mt-3 text-xs text-neutral-500">🚚 {shipNote}</p>}
        <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi, I have a question about " + p.name)}`} target="_blank" className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4">
          <WhatsAppIcon size={16} className="text-[#25D366]" /> Questions or bulk order? Chat on WhatsApp
        </a>
        <ul className="mt-6 space-y-1.5 border-t border-neutral-200 pt-5 text-sm text-neutral-600">
          <li className="flex items-center gap-2"><Truck size={16} className="text-plum" /> Free shipping on eligible orders</li>
          {p.paymentNote && <li className="flex items-center gap-2"><Banknote size={16} className="text-plum" /> {p.paymentNote}</li>}
          <li className="flex items-center gap-2"><Headset size={16} className="text-plum" /> Easy support from our team</li>
        </ul>
      </div>
    </>
  );
}
