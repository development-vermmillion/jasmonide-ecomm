import { Clock, CheckCircle2, Package, Truck, Home, Search } from "lucide-react";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import { all, one } from "@/lib/db";
import { fdatetime, inr } from "@/lib/util";

export const metadata = { title: "Track your order" };
const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function Track({ searchParams }: { searchParams: { number?: string; phone?: string } }) {
  if ((await getSettings()).track_enabled !== "1") notFound();
  const { number, phone } = searchParams;
  let order: any = null, items: any[] = [], tried = false;
  if (number && phone) {
    tried = true;
    const digits = phone.replace(/\D/g, "").slice(-10);
    const o = await one("select * from orders where upper(number) = upper(?)", [number.trim()]);
    if (o && (o.phone || "").replace(/\D/g, "").slice(-10) === digits && digits.length >= 6) {
      order = o;
      items = await all("select * from order_items where order_id = ?", [o.id]);
    }
  }
  const idx = order ? STEPS.indexOf(order.status) : -1;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Order status</p>
      <h1 className="h-serif mt-1 text-3xl">Track your order</h1>
      <form className="card mt-6 grid gap-3 p-5 sm:grid-cols-3">
        <input name="number" defaultValue={number} required placeholder="Order no. (e.g. JM1001)" className="input" />
        <input name="phone" defaultValue={phone} required placeholder="Phone used at checkout" className="input" />
        <button className="btn"><Search size={15} /> Track</button>
      </form>
      {tried && !order && <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">We couldn't find an order with those details.</p>}
      {order && (
        <div className="card mt-6 p-5">
          <div className="flex justify-between text-sm"><b>{order.number}</b><span className="text-neutral-500">{fdatetime(order.created_at)}</span></div>
          {["cancelled", "returned"].includes(order.status) ? (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm capitalize text-red-700">This order is {order.status}.</p>
          ) : (
            <ol className="mt-5 flex justify-between">
              {STEPS.map((st, i) => (
                <li key={st} className="flex-1 text-center">
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-xs ${i <= idx ? "bg-plum text-white" : "bg-neutral-200 text-neutral-500"}`}>{(() => { const Ic = [Clock, CheckCircle2, Package, Truck, Home][i]; return <Ic size={18} />; })()}</div>
                  <p className="mt-1 text-[11px] capitalize">{st}</p>
                </li>
              ))}
            </ol>
          )}
          {order.tracking && <p className="mt-4 text-sm">Tracking / courier ref: <b>{order.tracking}</b></p>}
          <ul className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100 text-sm">
            {items.map((i) => <li key={i.id} className="flex justify-between py-2"><span>{i.name}{i.variant_name ? ` — ${i.variant_name}` : ""} × {i.qty}</span><span>{inr(i.price * i.qty)}</span></li>)}
          </ul>
          <p className="mt-2 text-right font-semibold">Total {inr(order.total)}</p>
        </div>
      )}
    </div>
  );
}
