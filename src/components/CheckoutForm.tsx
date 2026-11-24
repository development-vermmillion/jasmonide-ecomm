"use client";
import { Banknote, Smartphone, Lock, Tag, CreditCard } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { useBulk } from "./useBulk";
import { inr } from "@/lib/util";

export default function CheckoutForm({ cfg }: { cfg: { shipping: number; freeMin: number; tax: number; cod: boolean; upi: boolean; online: boolean; onlineLabel: string; inclusive: boolean; coupons: boolean; me: any; loginRequired: boolean } }) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const bulk = useBulk(items);
  const [f, setF] = useState<any>({ name: cfg.me?.name || "", phone: cfg.me?.phone || "", email: cfg.me?.email || "", address: cfg.me?.address || "", city: cfg.me?.city || "", state: cfg.me?.state || "", pincode: cfg.me?.pincode || "", notes: "" });
  const [pay, setPay] = useState(cfg.online ? "online" : cfg.upi ? "upi" : cfg.cod ? "cod" : "");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [cmsg, setCmsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const physical = items.some((i) => i.type !== "digital");
  const discount = (coupon?.discount || 0) + bulk.discount;
  const after = subtotal - discount;
  const shipping = !physical || after >= cfg.freeMin ? 0 : cfg.shipping;
  const tax = cfg.inclusive ? Math.round((after - after / (1 + cfg.tax / 100)) * 100) / 100 : Math.round(after * cfg.tax) / 100;
  const total = after + shipping + (cfg.inclusive ? 0 : tax);

  async function applyCoupon() {
    const r = await (await fetch("/api/coupon", { method: "POST", body: JSON.stringify({ code, subtotal: subtotal - bulk.discount }) })).json();
    setCmsg(r.message);
    setCoupon(r.ok ? { code, discount: r.discount } : null);
  }
  async function place(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await (await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
        customer: f, payment_method: pay, coupon: coupon?.code,
      }),
    })).json();
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    clear();
    router.push(`/order/${r.number}?t=${r.token}${pay === "online" ? "&pay=1" : ""}`);
  }

  if (!ready) return null;
  if (cfg.loginRequired)
    return <div className="py-24 text-center"><p className="text-neutral-600">Please sign in to place an order.</p><Link href="/account/login?next=/checkout" className="btn mt-4">Sign in / Create account</Link></div>;
  if (!items.length)
    return <div className="py-24 text-center"><p className="h-serif text-2xl">Your bag is waiting</p><p className="mt-1 text-neutral-500">Something warm and lovely is out there for you.</p><Link href="/shop" className="btn mt-5">Find your glow</Link></div>;

  return (
    <form onSubmit={place} className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <h1 className="h-serif text-3xl">Checkout</h1>
        <section className="card space-y-3 p-5">
          <p className="eyebrow">Contact</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Full name *</label><input required className="input" value={f.name} onChange={set("name")} /></div>
            <div><label className="label">Phone *</label><input required className="input" value={f.phone} onChange={set("phone")} /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input" value={f.email} onChange={set("email")} /></div>
        </section>
        {physical && (
          <section className="card space-y-3 p-5">
            <p className="eyebrow">Shipping address</p>
            <div><label className="label">Address *</label><input required className="input" value={f.address} onChange={set("address")} /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className="label">City *</label><input required className="input" value={f.city} onChange={set("city")} /></div>
              <div><label className="label">State *</label><input required className="input" value={f.state} onChange={set("state")} /></div>
              <div><label className="label">PIN code *</label><input required className="input" value={f.pincode} onChange={set("pincode")} /></div>
            </div>
            <div><label className="label">Order notes</label><textarea className="input" rows={2} value={f.notes} onChange={set("notes")} /></div>
          </section>
        )}
        <section className="card space-y-2 p-5">
          <p className="eyebrow">Payment</p>
          {cfg.online && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm">
              <input type="radio" checked={pay === "online"} onChange={() => setPay("online")} /> <CreditCard size={18} className="text-plum" /> {cfg.onlineLabel}
            </label>
          )}
          {cfg.upi && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm">
              <input type="radio" checked={pay === "upi"} onChange={() => setPay("upi")} /> <Smartphone size={18} className="text-plum" /> UPI / bank transfer <span className="text-xs text-neutral-500">(QR & details shown after you place the order)</span>
            </label>
          )}
          {cfg.cod && physical && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm">
              <input type="radio" checked={pay === "cod"} onChange={() => setPay("cod")} /> <Banknote size={18} className="text-plum" /> Cash on delivery
            </label>
          )}
          {!(cfg.online || cfg.upi || (cfg.cod && physical)) && <p className="rounded-lg bg-butter p-3 text-sm">No payment method is available right now. Please contact us on WhatsApp to place your order.</p>}
        </section>
      </div>

      <aside className="lg:col-span-2">
        <div className="card sticky top-28 space-y-4 p-5">
          <p className="eyebrow">Order summary</p>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 text-sm">
                <img src={i.image} className="h-14 w-14 rounded-md object-cover" alt="" />
                <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-xs text-neutral-500">{i.variantName} × {i.qty}</p></div>
                <p>{inr(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          {cfg.coupons && <div className="flex gap-2">
            <input className="input" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="button" onClick={applyCoupon} className="btn-outline"><Tag size={14} /> Apply</button>
          </div>}
          {cmsg && <p className={`text-xs ${coupon ? "text-green-700" : "text-red-600"}`}>{cmsg}</p>}
          <dl className="space-y-1.5 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            {bulk.discount > 0 && <div className="flex justify-between text-green-700"><dt>{bulk.label}</dt><dd>−{inr(bulk.discount)}</dd></div>}
            {coupon && coupon.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon {coupon.code}</dt><dd>−{inr(coupon.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? inr(shipping) : "Free"}</dd></div>
            {tax > 0 && <div className="flex justify-between"><dt>{cfg.inclusive ? "Includes GST" : "GST"}</dt><dd>{inr(tax)}</dd></div>}
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(total)}</dd></div>
          </dl>
          {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
          <button disabled={busy || !pay} className="btn w-full">{busy ? "Placing order…" : <><Lock size={15} /> Place order · {inr(total)}</>}</button>
        </div>
      </aside>
    </form>
  );
}
