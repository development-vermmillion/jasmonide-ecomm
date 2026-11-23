"use client";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton } from "./ui";

export default function CategoriesManager({ cats }: { cats: any[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<any>(null);
  const [err, setErr] = useState("");
  const blank = { name: "", description: "", image: "", sort: cats.length };

  async function save() {
    const r = edit.id ? await call(`/api/admin/categories/${edit.id}`, "PUT", edit) : await call("/api/admin/categories", "POST", edit);
    if (!r.ok) return setErr(r.error);
    setEdit(null); setErr(""); router.refresh();
  }
  async function up(file?: File) {
    if (!file) return;
    const fd = new FormData(); fd.append("files", file);
    const r = await (await fetch("/api/admin/upload", { method: "POST", body: fd })).json();
    if (r.urls) setEdit({ ...edit, image: r.urls[0] });
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card overflow-hidden lg:col-span-2">
        <table className="w-full"><thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Category</th><th className="th">Slug</th><th className="th">Products</th><th className="th">Order</th><th className="th"></th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {cats.map((c) => (
              <tr key={c.id}>
                <td className="td"><div className="flex items-center gap-3">{c.image && <img src={c.image} className="h-10 w-10 rounded-full object-cover" alt="" />}<div><b>{c.name}</b><p className="text-xs text-neutral-500">{c.description}</p></div></div></td>
                <td className="td text-neutral-500">{c.slug}</td><td className="td">{c.product_count}</td><td className="td">{c.sort}</td>
                <td className="td text-right"><button className="mr-3 inline-flex items-center gap-1 text-xs underline" onClick={() => setEdit(c)}><Pencil size={13} />Edit</button><DeleteButton url={`/api/admin/categories/${c.id}`} confirm="Delete category? Products stay but become uncategorised." /></td>
              </tr>
            ))}
          </tbody></table>
      </div>
      <div className="card h-fit space-y-3 p-5">
        <div className="flex justify-between"><h2 className="font-semibold">{edit?.id ? "Edit category" : "Add category"}</h2>{edit && <button className="text-xs underline" onClick={() => setEdit(null)}>Cancel</button>}</div>
        {!edit ? <button className="btn w-full" onClick={() => setEdit(blank)}><Plus size={16} /> New category</button> : (
          <>
            <div><label className="label">Name *</label><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div><label className="label">Description</label><textarea className="input" rows={2} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div><label className="label">Image</label>{edit.image && <img src={edit.image} className="mb-2 h-16 w-16 rounded-full object-cover" alt="" />}<input type="file" accept="image/*" onChange={(e) => up(e.target.files?.[0])} className="text-xs" /></div>
            <div><label className="label">Sort order</label><input type="number" className="input" value={edit.sort} onChange={(e) => setEdit({ ...edit, sort: e.target.value })} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn w-full" onClick={save}>Save</button>
          </>
        )}
      </div>
    </div>
  );
}
