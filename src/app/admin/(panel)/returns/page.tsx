import { all } from "@/lib/db";
import ReturnRow from "@/components/admin/ReturnRow";

export default async function Returns() {
  const rows = await all("select r.*, o.number, o.name as customer_name, o.phone, o.total as order_total from returns r join orders o on o.id = r.order_id order by r.id desc");
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Returns & refunds</h1><p className="text-sm text-neutral-500">Customers request returns from their order page (turn the feature off in Settings).</p></div>
      <div className="space-y-3">{rows.map((r: any) => <ReturnRow key={r.id} r={r} />)}{!rows.length && <p className="card p-10 text-center text-neutral-500">No return requests.</p>}</div>
    </div>
  );
}
