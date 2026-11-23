import { Download, Search } from "lucide-react";
import { all } from "@/lib/db";
import { inr, fdate } from "@/lib/util";

export default async function Customers({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ? `%${searchParams.q}%` : "%";
  const rows = await all(
    `select c.*, count(o.id) as orders, coalesce(sum(case when o.status not in ('cancelled','returned') then o.total end),0) as spent, max(o.created_at) as last_order
     from customers c left join orders o on o.customer_id = c.id where (c.name like ? or c.email like ? or c.phone like ?) group by c.id order by spent desc`, [q, q, q]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Customers</h1><p className="text-sm text-neutral-500">{rows.length} customers · created automatically at checkout</p></div>
        <a href="/api/admin/export/customers" className="btn-outline"><Download size={16} /> Export CSV</a>
      </div>
      <form className="card flex gap-2 p-3"><input name="q" defaultValue={searchParams.q} placeholder="Search name, email or phone" className="input max-w-sm" /><button className="btn"><Search size={15} /> Search</button></form>
      <div className="card overflow-x-auto"><table className="w-full min-w-[640px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Customer</th><th className="th">Contact</th><th className="th">Orders</th><th className="th">Total spent</th><th className="th">Last order</th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((c: any) => (
            <tr key={c.id}><td className="td font-medium">{c.name}</td><td className="td text-neutral-600">{c.phone}<br /><span className="text-xs">{c.email}</span></td>
              <td className="td">{c.orders}</td><td className="td font-medium">{inr(c.spent)}</td><td className="td text-neutral-500">{fdate(c.last_order) || "—"}</td></tr>
          ))}
        </tbody></table></div>
    </div>
  );
}
