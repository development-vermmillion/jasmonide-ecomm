"use client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export async function call(url: string, method: string, body?: any) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  try { return await r.json(); } catch { return { ok: false, error: "Request failed" }; }
}

export function DeleteButton({ url, confirm: msg = "Delete this item? This cannot be undone.", label = "Delete", after }: { url: string; confirm?: string; label?: string; after?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} className="text-xs text-red-600 hover:underline disabled:opacity-50"
      onClick={async () => {
        if (!window.confirm(msg)) return;
        setBusy(true);
        const r = await call(url, "DELETE");
        setBusy(false);
        if (!r.ok) return window.alert(r.error || "Failed");
        after ? router.push(after) : router.refresh();
      }}><Trash2 size={13} className="mr-0.5 inline -mt-0.5" />{label}</button>
  );
}

export function Toast({ msg, kind = "ok" }: { msg: string; kind?: "ok" | "err" }) {
  if (!msg) return null;
  return <div className={`rounded-lg px-3 py-2 text-sm ${kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg}</div>;
}

export function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800", confirmed: "bg-sky-100 text-sky-800", processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-violet-100 text-violet-800", delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-700",
    returned: "bg-red-100 text-red-700", paid: "bg-green-100 text-green-800", failed: "bg-red-100 text-red-700", refunded: "bg-neutral-200 text-neutral-700",
    published: "bg-green-100 text-green-800", draft: "bg-neutral-200 text-neutral-700",
  };
  return <span className={`badge capitalize ${map[s] || "bg-neutral-100 text-neutral-700"}`}>{s}</span>;
}

export function Switch({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${on ? "bg-plum" : "bg-neutral-300"}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

/** Switch that saves instantly through /api/admin/toggle. */
export function QuickSwitch({ kind, id, on, onLabel = "Active", offLabel = "Draft" }: { kind: "products" | "coupons" | "reels" | "reviews" | "blog" | "faqs" | "bulk" | "taught"; id: number; on: boolean; onLabel?: string; offLabel?: string }) {
  const router = useRouter();
  const [v, setV] = useState(on);
  const [busy, setBusy] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <Switch on={v} disabled={busy} label={`${onLabel}/${offLabel}`} onChange={async (n) => {
        setBusy(true); setV(n);
        const r = await call("/api/admin/toggle", "POST", { kind, id, on: n });
        setBusy(false);
        if (!r.ok) { setV(!n); window.alert(r.error || "Failed"); } else router.refresh();
      }} />
      <span className={`text-xs ${v ? "text-plum" : "text-neutral-500"}`}>{v ? onLabel : offLabel}</span>
    </span>
  );
}
