"use client";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton, StatusBadge, QuickSwitch } from "./ui";
import { inr, PRODUCT_TYPES } from "@/lib/util";

export default function ProductsTable({ rows }: { rows: any[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<number[]>([]);
  const [msg, setMsg] = useState("");
  const all = rows.length > 0 && sel.length === rows.length;
  const toggle = (id: number) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function bulk(action: string) {
    if (!sel.length) return;
    if (action === "delete" && !confirm(`Delete ${sel.length} product(s)?`)) return;
    const r = await call("/api/admin/products/bulk", "POST", { ids: sel, action });
    if (!r.ok) return setMsg(r.error);
    setSel([]); setMsg(""); router.refresh();
  }
  return (
    <div className="card overflow-hidden">
      {(sel.length > 0 || msg) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-stone-150 px-4 py-2 text-sm">
          <b>{sel.length} selected</b>
          {["publish", "draft", "feature", "unfeature", "delete"].map((a) => (
            <button key={a} onClick={() => bulk(a)} className={`capitalize underline ${a === "delete" ? "text-red-600" : ""}`}>{a === "draft" ? "Unpublish" : a}</button>
          ))}
          {msg && <span className="text-red-600">{msg}</span>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-neutral-200 bg-neutral-50"><tr>
            <th className="th w-8"><input type="checkbox" checked={all} onChange={() => setSel(all ? [] : rows.map((r) => r.id))} /></th>
            <th className="th">Product</th><th className="th">Type</th><th className="th">Category</th><th className="th">Price</th><th className="th">Stock</th><th className="th">Status</th><th className="th"></th>
          </tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="td"><input type="checkbox" checked={sel.includes(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="td"><div className="flex items-center gap-3">
                  <img src={r.image} alt="" className="h-11 w-11 rounded-md object-cover" />
                  <div><Link href={`/admin/products/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                    <p className="text-xs text-neutral-500">{r.sku}{r.variants ? ` · ${r.variants} variants` : ""}{r.items ? ` · ${r.items} items` : ""}{r.featured ? " · ★ featured" : ""}</p></div></div></td>
                <td className="td text-xs">{PRODUCT_TYPES[r.type]?.split(" ")[0]}</td>
                <td className="td text-neutral-600">{r.category}</td>
                <td className="td">{r.from && <span className="text-xs text-neutral-500">from </span>}{inr(r.price)}{r.on_sale && <span className="badge ml-1.5 bg-clay-soft text-clay-dark">Sale</span>}{r.strike && <p className="text-xs text-neutral-400 line-through">{inr(r.strike)}</p>}</td>
                <td className="td">{!r.track ? "∞" : r.available >= 999999 ? "∞" : <span className={r.available <= 0 ? "font-semibold text-red-600" : r.available <= 5 ? "text-amber-700" : ""}>{r.available}</span>}</td>
                <td className="td"><QuickSwitch kind="products" id={r.id} on={r.status === "published"} onLabel="Active" offLabel="Draft" /></td>
                <td className="td whitespace-nowrap text-right">
                  <Link href={`/product/${r.slug}`} target="_blank" className="mr-3 inline-flex items-center gap-1 text-xs underline"><Eye size={13} />View</Link>
                  <Link href={`/admin/products/${r.id}`} className="mr-3 inline-flex items-center gap-1 text-xs underline"><Pencil size={13} />Edit</Link>
                  <DeleteButton url={`/api/admin/products/${r.id}`} confirm={`Delete “${r.name}”?`} />
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="py-16 text-center text-neutral-500">No products match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
