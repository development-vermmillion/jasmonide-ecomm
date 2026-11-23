import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { inr, fdatetime } from "@/lib/util";
import { getSettings } from "@/lib/catalog";
import OrderControls from "@/components/admin/OrderControls";
import PrintButton from "@/components/admin/PrintButton";
import { StatusBadge } from "@/components/admin/ui";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const o = await one("select * from orders where id = ?", [Number(params.id)]);
  if (!o) notFound();
  const [items, s] = await Promise.all([all("select * from order_items where order_id = ?", [o.id]), getSettings()]);
  const past = o.customer_id ? await one("select count(*) n, coalesce(sum(total),0) t from orders where customer_id = ? and status not in ('cancelled','returned')", [o.customer_id]) : null;
  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div><Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:underline"><ArrowLeft size={13} /> Orders</Link>
          <h1 className="h-serif text-3xl">{o.number} <StatusBadge s={o.status} /></h1><p className="text-sm text-neutral-500">Placed {fdatetime(o.created_at)}</p></div>
        <PrintButton />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card overflow-hidden" id="invoice">
            <div className="hidden border-b border-neutral-200 p-5 print:block"><p className="h-serif text-2xl font-semibold">{s.store_name}</p><p className="text-xs">{s.address} · {s.phone}</p><p className="mt-2 text-sm font-semibold">INVOICE {o.number}</p></div>
            <table className="w-full"><thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Item</th><th className="th">Price</th><th className="th">Qty</th><th className="th text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((i: any) => (
                  <tr key={i.id}><td className="td"><div className="flex items-center gap-3">{i.image && <img src={i.image} className="no-print h-10 w-10 rounded object-cover" alt="" />}<div><p className="font-medium">{i.name}</p>{i.variant_name && <p className="text-xs text-neutral-500">{i.variant_name}</p>}{i.type === "combo" && <p className="text-xs text-clay">Combo</p>}</div></div></td>
                    <td className="td">{inr(i.price)}</td><td className="td">{i.qty}</td><td className="td text-right">{inr(i.price * i.qty)}</td></tr>
                ))}
              </tbody></table>
            <div className="ml-auto max-w-xs space-y-1 p-5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
              {o.discount > 0 && <div className="flex justify-between"><span>Discount {o.coupon_code && `(${o.coupon_code})`}</span><span>−{inr(o.discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{inr(o.shipping)}</span></div>
              {o.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{inr(o.tax)}</span></div>}
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><span>Total</span><span>{inr(o.total)}</span></div>
            </div>
          </div>
          <div className="card p-5 text-sm">
            <h2 className="mb-2 font-semibold">Customer & delivery</h2>
            <p className="font-medium">{o.name}</p><p>{o.phone} {o.email && `· ${o.email}`}</p>
            <p className="mt-2 text-neutral-600">{[o.address, o.city, o.state, o.pincode].filter(Boolean).join(", ") || "No shipping address (digital order)"}</p>
            {o.notes && <p className="mt-2 rounded bg-amber-50 p-2 text-amber-900">Customer note: {o.notes}</p>}
            {past && <p className="mt-3 text-xs text-neutral-500">{past.n} order(s) · {inr(past.t)} lifetime value</p>}
          </div>
        </div>
        <OrderControls order={{ id: o.id, status: o.status, payment_status: o.payment_status, tracking: o.tracking, notes: o.notes, payment_method: o.payment_method, phone: o.phone, number: o.number }} />
      </div>
    </div>
  );
}
