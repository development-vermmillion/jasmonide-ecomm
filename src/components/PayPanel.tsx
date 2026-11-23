"use client";
import { Check, Copy, CreditCard, Smartphone, Landmark, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { payWithRazorpay } from "./razorpay";
import { inr } from "@/lib/util";

type Props = {
  number: string; token: string; method: string; total: number; autostart?: boolean; paymentRef?: string;
  upi?: { id: string; name: string; link: string; qr: string; customQr?: string; note: string; askRef: boolean };
  bank?: { label: string; value: string }[];
};

export default function PayPanel(p: Props) {
  const router = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState(p.paymentRef || ""); const [sent, setSent] = useState(!!p.paymentRef); const [copied, setCopied] = useState("");

  async function pay() {
    setBusy(true); setErr("");
    const r = await payWithRazorpay(p.number, p.token);
    setBusy(false);
    if (r.ok) router.refresh();
    else if (!r.dismissed) setErr(r.error || "Payment failed");
  }
  useEffect(() => { if (p.autostart && p.method === "online") pay(); /* eslint-disable-next-line */ }, []);
  const copy = (k: string, v: string) => { navigator.clipboard?.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 1500); };
  async function sendRef(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await (await fetch("/api/orders/payment-ref", { method: "POST", body: JSON.stringify({ number: p.number, token: p.token, ref }) })).json();
    if (!r.ok) return setErr(r.error);
    setSent(true); router.refresh();
  }

  if (p.method === "online")
    return (
      <div className="mt-6 rounded-xl border border-plum/20 bg-lilac/50 p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold"><CreditCard size={18} /> Payment pending — {inr(p.total)}</p>
        <p className="mt-1 text-neutral-600">Pay securely with UPI, cards, netbanking or wallets.</p>
        <button onClick={pay} disabled={busy} className="btn mt-3"><ShieldCheck size={16} /> {busy ? "Opening…" : `Pay ${inr(p.total)} now`}</button>
        {err && <p className="mt-2 text-red-600">{err}</p>}
      </div>
    );

  if (p.method === "upi" && p.upi)
    return (
      <div className="mt-6 rounded-xl border border-clay/30 bg-clay-soft p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold"><Smartphone size={18} /> Complete your payment — {inr(p.total)}</p>
        <p className="mt-1 text-neutral-700">{p.upi.note}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <img src={p.upi.customQr || p.upi.qr} alt="UPI QR code" className="h-48 w-48 rounded-lg bg-white p-2" />
            <p className="text-center text-[11px] text-neutral-600">Scan with any UPI app{p.upi.customQr ? "" : " — amount is pre-filled"}</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">UPI ID</p>
              <p className="flex items-center gap-2 text-base font-semibold">{p.upi.id}
                <button type="button" onClick={() => copy("id", p.upi!.id)} className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs font-normal">{copied === "id" ? <><Check size={12} className="inline" /> Copied</> : <><Copy size={12} className="inline" /> Copy</>}</button></p>
              <p className="text-xs text-neutral-600">Payee: {p.upi.name} · Amount: <b>{inr(p.total)}</b> · Note: <b>{p.number}</b></p>
            </div>
            <a href={p.upi.link} className="btn w-full sm:w-auto"><Smartphone size={16} /> Pay with UPI app</a>
            {p.bank && p.bank.length > 0 && (
              <div className="rounded-lg bg-white/70 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500"><Landmark size={13} /> Bank transfer</p>
                {p.bank.map((b) => <p key={b.label} className="flex justify-between gap-3 text-xs"><span className="text-neutral-500">{b.label}</span><span className="font-medium">{b.value}</span></p>)}
              </div>
            )}
          </div>
        </div>
        {p.upi.askRef && (
          <form onSubmit={sendRef} className="mt-4 border-t border-clay/20 pt-4">
            {sent ? <p className="flex items-center gap-2 text-green-700"><Check size={16} /> Reference <b>{ref}</b> received. We'll confirm your payment shortly.</p> : (
              <>
                <label className="label">After paying, enter your UPI reference / UTR number</label>
                <div className="flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="12-digit UTR e.g. 412345678901" value={ref} onChange={(e) => setRef(e.target.value)} /><button className="btn">Submit</button></div>
              </>
            )}
          </form>
        )}
        {err && <p className="mt-2 text-red-600">{err}</p>}
      </div>
    );
  return null;
}
