"use client";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { ins } from "@/lib/insights-client";

export default function PincodeCheck() {
  const [pin, setPin] = useState(""), [res, setRes] = useState<any>(null), [busy, setBusy] = useState(false);
  async function check(v = pin) {
    if (v.length !== 6) return setRes({ ok: false, message: "Enter a valid 6-digit pincode" });
    setBusy(true);
    const r = await (await fetch("/api/delivery?pin=" + v)).json().catch(() => null);
    setBusy(false); setRes(r);
    try { localStorage.setItem("pin", v); } catch {}
    ins("pincode", { label: r?.ok ? "ok" : "no" });
  }
  useEffect(() => { try { const v = localStorage.getItem("pin") || ""; if (/^\d{6}$/.test(v)) { setPin(v); check(v); } } catch {} }, []); // eslint-disable-line
  return (
    <div className="mt-4 rounded-xl border border-neutral-200 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium"><MapPin size={15} className="text-plum" /> Check delivery to your pincode</p>
      <form onSubmit={(e) => { e.preventDefault(); check(); }} className="flex gap-2">
        <input inputMode="numeric" maxLength={6} placeholder="e.g. 110001" className="input !py-2" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        <button className="btn-outline !py-2" disabled={busy}>{busy ? "…" : "Check"}</button>
      </form>
      {res && <p className={`mt-2 text-sm ${res.ok ? "text-green-700" : "text-red-600"}`}>{res.ok ? <>🚚 {res.message}{res.cod === false ? <span className="block text-xs text-neutral-500">Cash on delivery isn't available here — online/UPI works.</span> : null}</> : res.message}</p>}
    </div>
  );
}
