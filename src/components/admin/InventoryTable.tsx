"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { call } from "./ui";
import { inr } from "@/lib/util";

export default function InventoryTable({ rows }: { rows: any[] }) {
  const router = useRouter();
  const [val, setVal] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const key = (r: any) => `${r.product_id}-${r.variant_id || 0}`;

  async function apply(r: any, mode: "adjust" | "set", value?: number) {
    const v = value ?? Number(val[key(r)]);
    if (isNaN(v) || (value === undefined && !val[key(r)])) return setErr("Enter a quantity first");
    setBusy(key(r)); setErr("");
    const res = await call("/api/admin/stock", "POST", { productId: r.product_id, variantId: r.variant_id, mode, value: v, reason: mode === "set" ? "Manual stock count" : v >= 0 ? "Stock received" : "Stock removed" });
    setBusy("");
    if (!res.ok) return setErr(res.error);
    setVal({ ...val, [key(r)]: "" });
    router.refresh();
  }
  return (
    <div className="card overflow-hidden">
      {err && <p className="bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Product</th><th className="th">SKU</th><th className="th">Price</th><th className="th">On hand</th><th className="th">Level</th><th className="th">Adjust</th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r) => (
              <tr key={key(r)}>
                <td className="td"><div className="flex items-center gap-3"><img src={r.image} className="h-9 w-9 rounded object-cover" alt="" />
                  <div><Link href={`/admin/products/${r.product_id}`} className="font-medium hover:underline">{r.name}</Link>{r.variant && <p className="text-xs text-neutral-500">{r.variant}</p>}</div></div></td>
                <td className="td text-xs text-neutral-500">{r.sku || "—"}</td><td className="td">{inr(r.price)}</td>
                <td className="td text-lg font-semibold">{r.stock}</td>
                <td className="td"><span className={`badge ${r.stock <= 0 ? "bg-red-100 text-red-700" : r.stock <= r.low_stock ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{r.stock <= 0 ? "Out" : r.stock <= r.low_stock ? "Low" : "OK"}</span></td>
                <td className="td"><div className="flex items-center gap-1.5">
                  <input type="number" className="input !w-20 !py-1" placeholder="qty" value={val[key(r)] || ""} onChange={(e) => setVal({ ...val, [key(r)]: e.target.value })} />
                  <button disabled={busy === key(r)} className="btn-outline !px-3 !py-1 text-xs" title="Add this quantity (use negative to remove)" onClick={() => apply(r, "adjust")}>± Add</button>
                  <button disabled={busy === key(r)} className="btn-outline !px-3 !py-1 text-xs" title="Set stock to exactly this number" onClick={() => apply(r, "set")}>Set</button>
                </div></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="py-12 text-center text-neutral-500">Nothing here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
