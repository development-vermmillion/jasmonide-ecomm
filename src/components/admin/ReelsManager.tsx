"use client";
import { Film, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton, QuickSwitch, Switch } from "./ui";
import ImageField from "./ImageField";

const blank = { title: "", url: "", thumb: "", video_url: "", product_id: "", show_home: true, status: "active", sort: 0 };

export default function ReelsManager({ rows, products }: { rows: any[]; products: any[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [up, setUp] = useState(false);
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  async function save() {
    const r = editing ? await call(`/api/admin/reels/${editing}`, "PUT", f) : await call("/api/admin/reels", "POST", f);
    if (!r.ok) return setErr(r.error);
    setF(blank); setEditing(null); setErr(""); router.refresh();
  }
  async function video(fl?: File) {
    if (!fl) return;
    setUp(true);
    const fd = new FormData(); fd.append("files", fl);
    const r = await (await fetch("/api/admin/upload", { method: "POST", body: fd })).json();
    setUp(false);
    if (r.urls) set("video_url", r.urls[0]); else setErr(r.error);
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card overflow-x-auto lg:col-span-2"><table className="w-full min-w-[560px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Reel</th><th className="th">Product</th><th className="th">Home</th><th className="th">Status</th><th className="th"></th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((r) => (
            <tr key={r.id} className={r.status === "active" ? "" : "opacity-60"}>
              <td className="td"><div className="flex items-center gap-3">{r.thumb ? <img src={r.thumb} className="h-12 w-9 rounded object-cover" alt="" /> : <span className="flex h-12 w-9 items-center justify-center rounded bg-lilac"><Film size={16} /></span>}<div><p className="font-medium">{r.title || "Untitled"}</p><p className="max-w-[220px] truncate text-xs text-neutral-500">{r.url || r.video_url}</p></div></div></td>
              <td className="td text-sm">{r.product_name || "—"}</td>
              <td className="td text-sm">{r.show_home ? "Yes" : "No"}</td>
              <td className="td"><QuickSwitch kind="reels" id={r.id} on={r.status === "active"} onLabel="Active" offLabel="Draft" /></td>
              <td className="td whitespace-nowrap text-right"><button className="mr-3 inline-flex items-center gap-1 text-xs underline" onClick={() => { setEditing(r.id); setF({ ...r, product_id: r.product_id || "", show_home: !!r.show_home }); }}><Pencil size={13} />Edit</button><DeleteButton url={`/api/admin/reels/${r.id}`} /></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="py-12 text-center text-neutral-500">No reels yet. Add your first Instagram reel →</td></tr>}
        </tbody></table></div>
      <div className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">{editing ? "Edit reel" : "Add reel"}</h2>
        <div><label className="label">Instagram reel link</label><input className="input" placeholder="https://www.instagram.com/reel/…" value={f.url} onChange={(e) => set("url", e.target.value)} /></div>
        <div><label className="label">Title</label><input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div><label className="label">Thumbnail</label><ImageField value={f.thumb} onChange={(v) => set("thumb", v)} /></div>
        <div><label className="label">…or own video (mp4/webm, ≤40 MB)</label><label className="btn-outline cursor-pointer">{up ? "Uploading…" : f.video_url ? "Video set ✓ — replace" : "Upload video"}<input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => video(e.target.files?.[0])} /></label></div>
        <div><label className="label">Link to product</label><select className="input" value={f.product_id} onChange={(e) => set("product_id", e.target.value)}><option value="">— None —</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="label">Sort order</label><input type="number" className="input" value={f.sort} onChange={(e) => set("sort", e.target.value)} /></div></div>
        <label className="flex items-center gap-3 text-sm"><Switch on={!!f.show_home} onChange={(v) => set("show_home", v)} /> Show on home page</label>
        <label className="flex items-center gap-3 text-sm"><Switch on={f.status === "active"} onChange={(v) => set("status", v ? "active" : "draft")} /> {f.status === "active" ? "Active" : "Draft"}</label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2"><button className="btn" onClick={save}>{editing ? "Save" : "Add reel"}</button>{editing && <button className="btn-outline" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}</div>
      </div>
    </div>
  );
}
