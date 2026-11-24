"use client";
import { useState } from "react";
import Link from "next/link";
import { Repeat } from "lucide-react";

export default function SubscribeBox({ productId, variantId, qty, discount, intervals, disabled }: { productId: number; variantId: number | null; qty: number; discount: number; intervals: number[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false), [days, setDays] = useState(intervals[0] || 30), [msg, setMsg] = useState(""), [login, setLogin] = useState(false), [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/account/subscriptions", { method: "POST", body: JSON.stringify({ product_id: productId, variant_id: variantId, qty, every_days: days }) });
    const j = await r.json().catch(() => ({ ok: false, error: "Something went wrong" }));
    setBusy(false);
    if (r.status === 401) { setLogin(true); return setMsg("Please sign in so we know where to send your reminders."); }
    setMsg(j.ok ? `Done! We'll remind you every ${days} days with ${discount}% off your refill. Manage it in My account.` : j.error);
  }
  if (disabled) return null;
  return (
    <div className="mt-4 rounded-xl border border-dashed border-plum/40 bg-lilac/30 p-3 text-sm">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left font-medium"><Repeat size={15} className="text-plum" /> Subscribe & save {discount}% on refills<span className="ml-auto text-xs text-neutral-500">{open ? "–" : "+"}</span></button>
      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-neutral-600">Never run out. We'll remind you when it's time and you'll get {discount}% off. Pause or cancel any time — no payment is taken until you confirm.</p>
          <div className="flex flex-wrap gap-2">{intervals.map((d) => <button type="button" key={d} onClick={() => setDays(d)} className={`rounded-full border px-3 py-1 text-xs ${days === d ? "border-plum bg-plum text-white" : "border-neutral-300"}`}>Every {d} days</button>)}</div>
          <button type="button" onClick={go} disabled={busy} className="btn !py-2 text-xs">{busy ? "Saving…" : "Start my refill plan"}</button>
          {msg && <p className="text-xs">{msg} {login && <Link className="underline" href={`/account/login?next=${encodeURIComponent(typeof location !== "undefined" ? location.pathname : "/")}`}>Sign in</Link>}</p>}
        </div>
      )}
    </div>
  );
}
