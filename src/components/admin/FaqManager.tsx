"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton, QuickSwitch } from "./ui";
import { Pencil } from "lucide-react";

const blank = { question: "", answer: "", sort: 0, active: true };
export default function FaqManager({ rows }: { rows: any[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>(blank); const [editing, setEditing] = useState<number | null>(null); const [err, setErr] = useState("");
  async function save() {
    const r = editing ? await call(`/api/admin/faqs/${editing}`, "PUT", f) : await call("/api/admin/faqs", "POST", f);
    if (!r.ok) return setErr(r.error);
    setF(blank); setEditing(null); setErr(""); router.refresh();
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card divide-y divide-neutral-100 lg:col-span-2">
        {rows.map((r) => (
          <div key={r.id} className={`p-4 ${r.active ? "" : "opacity-60"}`}>
            <p className="font-medium">{r.question}</p><p className="mt-1 whitespace-pre-line text-sm text-neutral-600">{r.answer}</p>
            <div className="mt-2 flex items-center gap-4"><QuickSwitch kind="faqs" id={r.id} on={!!r.active} onLabel="Shown" offLabel="Hidden" /><button className="inline-flex items-center gap-1 text-xs underline" onClick={() => { setEditing(r.id); setF({ ...r, active: !!r.active }); }}><Pencil size={12} />Edit</button><DeleteButton url={`/api/admin/faqs/${r.id}`} /></div>
          </div>
        ))}
        {!rows.length && <p className="p-10 text-center text-neutral-500">No FAQs yet.</p>}
      </div>
      <div className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">{editing ? "Edit FAQ" : "Add FAQ"}</h2>
        <div><label className="label">Question</label><input className="input" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} /></div>
        <div><label className="label">Answer</label><textarea rows={5} className="input" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} /></div>
        <div><label className="label">Sort order</label><input type="number" className="input" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2"><button className="btn" onClick={save}>{editing ? "Save" : "Add"}</button>{editing && <button className="btn-outline" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}</div>
      </div>
    </div>
  );
}
