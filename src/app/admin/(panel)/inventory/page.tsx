import { Download } from "lucide-react";
import Link from "next/link";
import { all } from "@/lib/db";
import InventoryTable from "@/components/admin/InventoryTable";
import { fdatetime } from "@/lib/util";

export default async function Inventory({ searchParams }: { searchParams: { filter?: string; q?: string } }) {
  const rows = await all(`select * from (
      select p.id as product_id, null as variant_id, p.name, '' as variant, p.sku, p.stock, p.low_stock, p.price, p.images, p.status from products p where p.type='simple' and p.track_stock=1
      union all
      select p.id, v.id, p.name, v.name, v.sku, v.stock, p.low_stock, v.price, p.images, p.status from variants v join products p on p.id=v.product_id where p.track_stock=1
    ) order by name, variant`);
  const filter = searchParams.filter || "";
  const q = (searchParams.q || "").toLowerCase();
  const view = rows.filter((r: any) => (filter === "low" ? r.stock > 0 && r.stock <= r.low_stock : filter === "out" ? r.stock <= 0 : true) && (!q || (r.name + r.variant + r.sku).toLowerCase().includes(q)));
  const log = await all(`select l.*, p.name as pname, v.name as vname from stock_log l left join products p on p.id = l.product_id left join variants v on v.id = l.variant_id order by l.id desc limit 15`);
  const counts = { all: rows.length, low: rows.filter((r: any) => r.stock > 0 && r.stock <= r.low_stock).length, out: rows.filter((r: any) => r.stock <= 0).length };
  const units = rows.reduce((a: number, r: any) => a + Math.max(0, r.stock), 0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Inventory & stock</h1><p className="text-sm text-neutral-500">{units} units across {rows.length} stock lines. Combos &amp; digital products are not listed — combos draw from their items.</p></div>
        <a href="/api/admin/export/inventory" className="btn-outline"><Download size={16} /> Export CSV</a>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {[["", `All (${counts.all})`], ["low", `Low stock (${counts.low})`], ["out", `Out of stock (${counts.out})`]].map(([v, l]) => (
          <Link key={v} href={`/admin/inventory${v ? `?filter=${v}` : ""}`} className={`rounded-full border px-4 py-1.5 text-sm ${filter === v ? "border-plum bg-plum text-white" : "border-neutral-300 bg-white"}`}>{l}</Link>
        ))}
        <form className="ml-auto"><input name="q" defaultValue={searchParams.q} placeholder="Search SKU / name" className="input w-52" />{filter && <input type="hidden" name="filter" value={filter} />}</form>
      </div>
      <InventoryTable rows={view.map((r: any) => ({ ...r, image: (() => { try { return JSON.parse(r.images)[0]; } catch { return ""; } })() }))} />
      <div className="card p-5">
        <h2 className="mb-3 font-semibold">Recent stock movements</h2>
        <table className="w-full"><tbody className="divide-y divide-neutral-100">
          {log.map((l: any) => (
            <tr key={l.id}><td className="td">{l.pname}{l.vname ? ` — ${l.vname}` : ""}</td>
              <td className={`td font-medium ${l.delta >= 0 ? "text-green-700" : "text-red-600"}`}>{l.delta >= 0 ? "+" : ""}{l.delta}</td>
              <td className="td text-neutral-500">→ {l.balance}</td><td className="td text-neutral-600">{l.reason} {l.ref && <span className="text-xs text-neutral-400">{l.ref}</span>}</td>
              <td className="td text-right text-xs text-neutral-400">{fdatetime(l.created_at)}</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
