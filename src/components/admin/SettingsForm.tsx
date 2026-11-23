"use client";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, Switch } from "./ui";
import { FEATURES } from "@/lib/features";
import Upl from "./ImageField";

const GROUPS: [string, [string, string, string?][]][] = [
    ["Contact & social", [["whatsapp", "WhatsApp number (with country code, no +)"], ["phone", "Phone"], ["email", "Email"], ["address", "Address"], ["instagram", "Instagram URL"], ["youtube", "YouTube URL"]]],
  ["Instagram reels & returns", [["reels_title", "Reels section title"], ["reels_handle", "Instagram handle (e.g. @yourbrand)"], ["return_days", "Return window (days after delivery)", "number"], ["maintenance_message", "Maintenance-mode message"]]],
  ["Shipping (GST and payments have their own pages)", [["shipping_flat", "Flat shipping fee (₹)", "number"], ["free_shipping_min", "Free shipping above (₹)", "number"]]],
];

export default function SettingsForm({ initial, canEdit }: { initial: Record<string, string>; canEdit: boolean }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  async function save() {
    const r = await call("/api/admin/settings", "PUT", f);
    setMsg(r.ok ? "Settings saved ✓" : r.error);
    if (r.ok) router.refresh();
  }
  return (
    <div className="space-y-5">
      {!canEdit && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Only owners can change settings.</p>}
      <section className="card p-5">
        <h2 className="font-semibold">Feature switches</h2>
        <p className="mb-4 text-xs text-neutral-500">Turn any feature on or off. Remember to press “Save settings” at the bottom.</p>
        {Array.from(new Set(FEATURES.map((x) => x.group))).map((g) => (
          <div key={g} className="mb-4">
            <p className="eyebrow mb-2">{g}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEATURES.filter((x) => x.group === g).map((x) => (
                <div key={x.key} className={`flex items-center justify-between gap-3 rounded-lg p-3 ${f[x.key] === "1" ? "bg-mint/50" : "bg-neutral-100"}`}>
                  <div className="min-w-0"><p className="text-sm font-medium">{x.label}</p><p className="text-xs text-neutral-500">{x.desc}</p></div>
                  <Switch on={f[x.key] === "1"} disabled={!canEdit} label={x.label} onChange={(v) => setF({ ...f, [x.key]: v ? "1" : "0" })} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      {GROUPS.map(([title, fields]) => (
        <section key={title} className="card p-5">
          <h2 className="mb-3 font-semibold">{title}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map(([k, label, kind]) => kind === "image" ? (
              <div key={k}><label className="label">{label}</label><Upl value={f[k] ?? ""} disabled={!canEdit} onChange={(v) => setF({ ...f, [k]: v })} /></div>
            ) : kind === "toggle" ? (
              <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!canEdit} checked={f[k] === "1"} onChange={(e) => setF({ ...f, [k]: e.target.checked ? "1" : "0" })} /> {label}</label>
            ) : (
              <div key={k} className={["announcement", "hero_text", "address", "bank_details"].includes(k) ? "sm:col-span-2" : ""}>
                <label className="label">{label}</label><input type={kind || "text"} disabled={!canEdit} className="input" value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="flex items-center gap-3"><button disabled={!canEdit} className="btn" onClick={save}><Save size={16} /> Save settings</button>{msg && <span className="text-sm">{msg}</span>}</div>
    </div>
  );
}
