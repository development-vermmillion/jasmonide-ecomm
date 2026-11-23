import { Download, Search } from "lucide-react";
import Link from "next/link";
import { all } from "@/lib/db";
import { inr, fdatetime, ORDER_STATUSES } from "@/lib/util";
import { StatusBadge } from "@/components/admin/ui";

export default async function Orders({ searchParams }: { searchParams: { status?: string; q?: string; payment?: string } }) {
  const where: string[] = [], args: any[] = [];
  if (searchParams.status) { where.push("status = ?"); args.push(searchParams.status); }
  if (searchParams.payment) { where.push("payment_status = ?"); args.push(searchParams.payment); }
  if (searchParams.q) { where.push("(number like ? or name like ? or phone like ? or email like ?)"); args.push(...Array(4).fill(`%${searchParams.q}%`)); }
  const [orders, counts] = await Promise.all([
    all(`select * from orders ${where.length ? "where " + where.join(" and ") : ""} order by id desc limit 200`, args),
    all("select status, count(*) n from orders group by status"),
  ]);
  const n = (s: string) => counts.find((c: any) => c.status === s)?.n || 0;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Orders</h1><p className="text-sm text-neutral-500">{orders.length} shown</p></div>
        <a href="/api/admin/export/orders" className="btn-outline"><Download size={16} /> Export CSV</a>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`rounded-full border px-3 py-1 text-sm ${!searchParams.status ? "border-plum bg-plum text-white" : "border-neutral-300 bg-white"}`}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full border px-3 py-1 text-sm capitalize ${searchParams.status === s ? "border-plum bg-plum text-white" : "border-neutral-300 bg-white"}`}>{s} ({n(s)})</Link>
        ))}
      </div>
      <form className="card flex flex-wrap gap-2 p-3">
        <input name="q" defaultValue={searchParams.q} placeholder="Search order no., name, phone, email" className="input max-w-sm" />
        {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
        <select name="payment" defaultValue={searchParams.payment || ""} className="input w-auto"><option value="">Any payment</option><option value="pending">Payment pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
        <button className="btn"><Search size={15} /> Search</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Payment</th><th className="th">Status</th><th className="th text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="td"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.number}</Link></td>
                <td className="td">{o.name}<p className="text-xs text-neutral-500">{o.phone}</p></td>
                <td className="td text-neutral-600">{fdatetime(o.created_at)}</td>
                <td className="td"><span className="mr-1 text-xs uppercase text-neutral-500">{o.payment_method}</span><StatusBadge s={o.payment_status} /></td>
                <td className="td"><StatusBadge s={o.status} /></td>
                <td className="td text-right font-medium">{inr(o.total)}</td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="py-16 text-center text-neutral-500">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
