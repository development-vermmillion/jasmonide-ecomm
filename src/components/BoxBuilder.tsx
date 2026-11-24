"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Plus, X, Check } from "lucide-react";
import { useCart } from "./cart";
import { inr } from "@/lib/util";

type V = { id: number; name: string; price: number; max: number };
type P = { id: number; name: string; slug: string; image: string; type: string; cat: string; price: number; max: number; variants: V[] };
type Pick = { p: P; v: V | null };

export default function BoxBuilder({ products, slots, discount, note }: { products: P[]; slots: number; discount: number; note: string }) {
  const { add, setOpen } = useCart();
  const router = useRouter();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [opt, setOpt] = useState<Record<number, number>>({});
  const [msg, setMsg] = useState("");
  const [to, setTo] = useState("");
  const full = picks.length >= slots;
  const sub = picks.reduce((a, x) => a + (x.v?.price ?? x.p.price), 0);
  const off = Math.round((sub * discount) / 100);
  const cats = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.cat).filter(Boolean)))], [products]);
  const [cat, setCat] = useState("All");

  function addPick(p: P) {
    if (full) return;
    const v = p.type === "variable" ? p.variants.find((x) => x.id === opt[p.id]) || p.variants[0] : null;
    setPicks((c) => [...c, { p, v }]);
  }
  function finish() {
    // same product twice is merged into quantity by the cart
    for (const { p, v } of picks) add({ productId: p.id, variantId: v?.id ?? null, name: p.name, variantName: v?.name ?? "", price: v?.price ?? p.price, image: p.image, slug: p.slug, max: v?.max ?? p.max, type: p.type }, 1);
    setOpen(false); // the bag drawer would cover the checkout page
    try { localStorage.setItem("boxMeta", JSON.stringify({ coupon: discount > 0 ? "GIFTBOX" : "", note: `🎁 GIFT BOX${to ? " for " + to : ""}${msg ? ` — card message: "${msg}"` : ""}` })); } catch {}
    router.push("/checkout");
  }
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${cat === c ? "border-plum bg-plum text-white" : "border-neutral-200 bg-white hover:border-plum"}`}>{c}</button>)}</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.filter((p) => cat === "All" || p.cat === cat).map((p) => {
            const n = picks.filter((x) => x.p.id === p.id).length;
            return (
              <div key={p.id} className="card sf-lift overflow-hidden">
                <div className="relative aspect-square overflow-hidden"><img src={p.image} alt={p.name} className="h-full w-full object-cover" />{n > 0 && <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-plum px-1.5 text-xs font-semibold text-white">×{n}</span>}</div>
                <div className="p-3">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{p.name}</p>
                  {p.type === "variable" && <select className="input mt-2 !py-1.5 text-xs" value={opt[p.id] ?? p.variants[0].id} onChange={(e) => setOpt({ ...opt, [p.id]: Number(e.target.value) })}>{p.variants.map((v) => <option key={v.id} value={v.id}>{v.name} — {inr(v.price)}</option>)}</select>}
                  <div className="mt-2 flex items-center justify-between"><span className="text-sm font-semibold">{inr(p.type === "variable" ? (p.variants.find((v) => v.id === (opt[p.id] ?? p.variants[0].id)) || p.variants[0]).price : p.price)}</span>
                    <button disabled={full} onClick={() => addPick(p)} className="flex h-8 w-8 items-center justify-center rounded-full bg-plum text-white transition hover:scale-110 disabled:opacity-30" aria-label={`Add ${p.name}`}><Plus size={16} /></button></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card space-y-4 p-5">
          <div className="flex items-center gap-2"><Gift size={20} className="text-plum" /><h2 className="h-serif text-xl">Your gift box</h2><span className="ml-auto text-sm text-neutral-500">{picks.length}/{slots}</span></div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: slots }).map((_, i) => { const x = picks[i]; return (
              <div key={i} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${x ? "border-transparent" : "border-dashed border-neutral-300"} bg-lilac/30`}>
                {x ? <><img src={x.p.image} alt="" className="h-full w-full object-cover" /><button onClick={() => setPicks(picks.filter((_, j) => j !== i))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow" aria-label="Remove"><X size={13} /></button></>
                  : <span className="flex h-full items-center justify-center text-xl text-neutral-300">+</span>}
              </div>); })}
          </div>
          <div><label className="label">Who is it for? (optional)</label><input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Maa" /></div>
          <div><label className="label">Handwritten card message</label><textarea rows={3} maxLength={200} className="input" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Happy birthday! Light this when you need a little warmth…" /><p className="text-right text-[11px] text-neutral-400">{msg.length}/200</p></div>
          <div className="space-y-1 border-t border-neutral-100 pt-3 text-sm">
            <div className="flex justify-between"><span>Items</span><span>{inr(sub)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Gift box saving ({discount}%)</span><span>−{inr(off)}</span></div>}
            <div className="flex justify-between font-semibold"><span>Total</span><span>{inr(sub - off)}</span></div>
            <p className="text-xs text-neutral-500">{note}</p>
          </div>
          <button disabled={picks.length < 1} onClick={finish} className="btn w-full">{full ? <><Check size={16} /> Add box & checkout</> : picks.length ? `Add box (${slots - picks.length} more fits)` : `Pick up to ${slots} items`}</button>
        </div>
      </aside>
    </div>
  );
}
