"use client";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, Switch } from "./ui";
import ImageField from "./ImageField";
import type { FieldGroup } from "@/lib/site-fields";

export default function FieldsForm({ groups, initial, canEdit }: { groups: FieldGroup[]; initial: Record<string, string>; canEdit: boolean }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState("");
  async function save() {
    const r = await call("/api/admin/settings", "PUT", f);
    setMsg(r.ok ? "Saved ✓ — live on your site now" : r.error);
    if (r.ok) { setF((s) => ({ ...s, razorpay_key_secret: "", razorpay_webhook_secret: "" })); router.refresh(); }
  }
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  return (
    <div className="space-y-5 pb-20">
      {!canEdit && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Only owners can change these.</p>}
      {groups.map((g) => (
        <section key={g.title} className="card p-5">
          <h2 className="font-semibold">{g.title}</h2>
          {g.note && <p className="mb-3 text-xs text-neutral-500">{g.note}</p>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {g.fields.map((x) => x.type === "toggle" ? (
              <label key={x.key} className="flex items-center gap-3 rounded-lg bg-lilac/40 p-3 text-sm"><Switch on={f[x.key] === "1"} disabled={!canEdit} onChange={(v) => set(x.key, v ? "1" : "0")} />{x.label}</label>
            ) : (
              <div key={x.key} className={x.type === "area" ? "sm:col-span-2" : ""}>
                <label className="label">{x.label}</label>
                {x.type === "area" ? <textarea rows={3} className="input" disabled={!canEdit} value={f[x.key] ?? ""} onChange={(e) => set(x.key, e.target.value)} />
                  : x.type === "image" ? <ImageField value={f[x.key] ?? ""} disabled={!canEdit} onChange={(v) => set(x.key, v)} />
                  : x.type === "secret" ? <input type="password" autoComplete="new-password" className="input" disabled={!canEdit} value={f[x.key] ?? ""} placeholder={initial[x.key + "_set"] === "1" ? "•••••••• saved — type to replace" : "Not set"} onChange={(e) => set(x.key, e.target.value)} />
                  : <input className="input" disabled={!canEdit} value={f[x.key] ?? ""} onChange={(e) => set(x.key, e.target.value)} />}
                {x.help && <p className="mt-1 text-xs text-neutral-500">{x.help}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="no-print fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-neutral-200 bg-paper/95 px-4 py-3 backdrop-blur lg:left-64">
        <button disabled={!canEdit} className="btn" onClick={save}><Save size={16} /> Save changes</button>{msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
