"use client";
import { Banknote, Smartphone, Lock, Tag, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { track } from "@/lib/track-client";
import { ins } from "@/lib/insights-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart";
import { useBulk } from "./useBulk";
import { inr } from "@/lib/util";
import { walletCalc } from "@/lib/wallet-calc";

export default function CheckoutForm({ cfg }: { cfg: { shipping: number; freeMin: number; tax: number; cod: boolean; upi: boolean; online: boolean; onlineLabel: string; inclusive: boolean; coupons: boolean; me: any; loginRequired: boolean; wallet: { gift: boolean; credit: boolean; points: boolean; maxPct: number; minRedeem: number; referral: boolean; referralMin: number }; pin: { cod_blocked: string } } }) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const bulk = useBulk(items);
  const [f, setF] = useState<any>({ name: cfg.me?.name && cfg.me.name !== "Customer" ? cfg.me.name : "", phone: cfg.me?.phone || "", email: cfg.me?.email || "", address: cfg.me?.address || "", city: cfg.me?.city || "", state: cfg.me?.state || "", pincode: cfg.me?.pincode || "", notes: "" });
  const [pay, setPay] = useState(cfg.online ? "online" : cfg.upi ? "upi" : cfg.cod ? "cod" : "");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [cmsg, setCmsg] = useState("");
  const [gift, setGift] = useState<{ code: string; balance: number } | null>(null), [gcode, setGcode] = useState(""), [gmsg, setGmsg] = useState("");
  const [useCredit, setUseCredit] = useState(true), [usePts, setUsePts] = useState(false);
  const [ref, setRef] = useState<{ code: string; discount: number } | null>(null), [rcode, setRcode] = useState(""), [rmsg, setRmsg] = useState("");
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string; cod?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const physical = items.some((i) => i.type !== "digital");
  const discount = (coupon?.discount || 0) + bulk.discount + (ref?.discount || 0);
  const after = subtotal - discount;
  const shipping = !physical || after >= cfg.freeMin ? 0 : cfg.shipping;
  const tax = cfg.inclusive ? Math.round((after - after / (1 + cfg.tax / 100)) * 100) / 100 : Math.round(after * cfg.tax) / 100;
  const gross = after + shipping + (cfg.inclusive ? 0 : tax);
  const w = walletCalc(gross, { gift: gift?.balance || 0, credit: cfg.wallet.credit ? cfg.me?.credit || 0 : 0, useCredit, points: cfg.wallet.points ? cfg.me?.points || 0 : 0, pointsWanted: usePts ? 1e9 : 0, maxPct: cfg.wallet.maxPct, minRedeem: cfg.wallet.minRedeem });
  const total = w.payable;
  const walletOnly = gross > 0 && total <= 0.009;
  const codBlocked = pinMsg?.cod === false;
  async function applyGift() { const r = await (await fetch("/api/wallet", { method: "POST", body: JSON.stringify({ kind: "gift", code: gcode }) })).json(); setGmsg(r.message); setGift(r.ok ? { code: r.code, balance: r.balance } : null); }
  async function applyRef() { const r = await (await fetch("/api/wallet", { method: "POST", body: JSON.stringify({ kind: "referral", code: rcode, goods: subtotal - bulk.discount - (coupon?.discount || 0), email: f.email, phone: f.phone }) })).json(); setRmsg(r.message); setRef(r.ok ? { code: rcode.trim().toUpperCase(), discount: r.discount } : null); }
  useEffect(() => { // a friend's link (?ref=CODE) was opened earlier
    if (!ready || !items.length || !cfg.wallet.referral) return;
    try { const c = localStorage.getItem("ref"); if (c && !ref) { setRcode(c); fetch("/api/wallet", { method: "POST", body: JSON.stringify({ kind: "referral", code: c, goods: subtotal, email: f.email, phone: f.phone }) }).then((r) => r.json()).then((r) => { setRmsg(r.message); if (r.ok) setRef({ code: c.toUpperCase(), discount: r.discount }); }); } } catch {}
  }, [ready]); // eslint-disable-line
  useEffect(() => {
    if (f.pincode.length !== 6) { setPinMsg(null); return; }
    const t = setTimeout(async () => { const r = await (await fetch("/api/delivery?pin=" + f.pincode)).json().catch(() => null); if (r) { setPinMsg({ ok: r.ok, text: r.message, cod: r.ok ? r.cod : undefined }); if (r.ok && r.cod === false && pay === "cod") setPay(cfg.online ? "online" : cfg.upi ? "upi" : ""); } }, 350);
    return () => clearTimeout(t);
  }, [f.pincode]); // eslint-disable-line

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
        customer: f, payment_method: walletOnly ? "wallet" : pay, coupon: coupon?.code, giftCode: gift?.code, useCredit: useCredit && w.credit > 0, points: w.points, referral: ref?.code, session: (() => { try { return localStorage.getItem("sid") || ""; } catch { return ""; } })(),
      }),
    })).json();
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    clear();
    router.push(`/order/${r.number}?t=${r.token}${pay === "online" ? "&pay=1" : ""}`);
  }

  useEffect(() => {
    if (!ready || !items.length) return;
    try {
      const m = JSON.parse(localStorage.getItem("boxMeta") || "null");
      if (!m) return;
      localStorage.removeItem("boxMeta");
      if (m.note) setF((x: any) => ({ ...x, notes: x.notes ? x.notes + "\n" + m.note : m.note }));
      if (m.coupon) fetch("/api/coupon", { method: "POST", body: JSON.stringify({ code: m.coupon, subtotal }) }).then((r) => r.json()).then((r) => { setCmsg(r.message); if (r.ok) { setCode(m.coupon); setCoupon({ code: m.coupon, discount: r.discount }); } });
    } catch {}
  }, [ready]); // eslint-disable-line
  // remember the cart once we know how to reach the shopper (lets you follow up in Admin → Sources & carts)
  useEffect(() => {
    if (!ready || !items.length || (!f.email && String(f.phone).replace(/\D/g, "").length < 10)) return;
    const t = setTimeout(() => {
      let sid = ""; try { sid = localStorage.getItem("sid") || ""; if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("sid", sid); } } catch {}
      fetch("/api/cart/capture", { method: "POST", body: JSON.stringify({ session: sid, name: f.name, email: f.email, phone: f.phone, items, total: subtotal }), keepalive: true }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [ready, f.email, f.phone, f.name, items.length]); // eslint-disable-line
  useEffect(() => { if (ready && items.length) ins("checkout", { val: subtotal }); track("begin_checkout", { items: items.map((i) => ({ id: i.productId, name: i.name, price: i.price, qty: i.qty })), value: subtotal }); }, [ready]); // eslint-disable-line
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
              <div><label className="label">PIN code *</label><input required inputMode="numeric" maxLength={6} className="input" value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, "") })} />{pinMsg && <p className={`mt-1 text-xs ${pinMsg.ok ? "text-green-700" : "text-red-600"}`}>{pinMsg.ok ? "🚚 " : ""}{pinMsg.text}</p>}</div>
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
          {cfg.cod && physical && !codBlocked && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm">
              <input type="radio" checked={pay === "cod"} onChange={() => setPay("cod")} /> <Banknote size={18} className="text-plum" /> Cash on delivery
            </label>
          )}
          {walletOnly && <p className="rounded-lg bg-mint p-3 text-sm text-green-800">Your gift card / credit / points cover this whole order — nothing more to pay. 🎉</p>}
          {!walletOnly && !(cfg.online || cfg.upi || (cfg.cod && physical && !codBlocked)) && <p className="rounded-lg bg-butter p-3 text-sm">No payment method is available right now. Please contact us on WhatsApp to place your order.</p>}
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
          {cfg.wallet.referral && <div className="flex gap-2"><input className="input" placeholder="Friend's referral code" value={rcode} onChange={(e) => setRcode(e.target.value)} /><button type="button" onClick={applyRef} className="btn-outline">Apply</button></div>}
          {rmsg && <p className={`text-xs ${ref ? "text-green-700" : "text-red-600"}`}>{rmsg}</p>}
          {cfg.wallet.gift && <div className="flex gap-2"><input className="input" placeholder="Gift card code" value={gcode} onChange={(e) => setGcode(e.target.value)} /><button type="button" onClick={applyGift} className="btn-outline">Apply</button></div>}
          {gmsg && <p className={`text-xs ${gift ? "text-green-700" : "text-red-600"}`}>{gmsg}</p>}
          {cfg.me && cfg.wallet.credit && cfg.me.credit > 0 && <label className="flex items-center gap-2 rounded-lg bg-lilac/40 p-2.5 text-sm"><input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} /> Use my store credit ({inr(cfg.me.credit)})</label>}
          {cfg.me && cfg.wallet.points && cfg.me.points >= cfg.wallet.minRedeem && cfg.me.points > 0 && <label className="flex items-center gap-2 rounded-lg bg-lilac/40 p-2.5 text-sm"><input type="checkbox" checked={usePts} onChange={(e) => setUsePts(e.target.checked)} /> Use my loyalty points ({cfg.me.points} pts = {inr(cfg.me.points)}, up to {cfg.wallet.maxPct}% of the order)</label>}
          <dl className="space-y-1.5 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            {bulk.discount > 0 && <div className="flex justify-between text-green-700"><dt>{bulk.label}</dt><dd>−{inr(bulk.discount)}</dd></div>}
            {coupon && coupon.discount > 0 && <div className="flex justify-between text-green-700"><dt>Coupon {coupon.code}</dt><dd>−{inr(coupon.discount)}</dd></div>}
            {ref && ref.discount > 0 && <div className="flex justify-between text-green-700"><dt>Friend referral</dt><dd>−{inr(ref.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? inr(shipping) : "Free"}</dd></div>
            {tax > 0 && <div className="flex justify-between"><dt>{cfg.inclusive ? "Includes GST" : "GST"}</dt><dd>{inr(tax)}</dd></div>}
            {w.gift > 0 && <div className="flex justify-between text-green-700"><dt>Gift card</dt><dd>−{inr(w.gift)}</dd></div>}
            {w.credit > 0 && <div className="flex justify-between text-green-700"><dt>Store credit</dt><dd>−{inr(w.credit)}</dd></div>}
            {w.points > 0 && <div className="flex justify-between text-green-700"><dt>Loyalty points ({w.points})</dt><dd>−{inr(w.points)}</dd></div>}
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>{w.gift + w.credit + w.points > 0 ? "To pay" : "Total"}</dt><dd>{inr(total)}</dd></div>
          </dl>
          {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
          <button disabled={busy || (!pay && !walletOnly)} className="btn w-full">{busy ? "Placing order…" : <><Lock size={15} /> Place order · {inr(total)}</>}</button>
        </div>
      </aside>
    </form>
  );
}
