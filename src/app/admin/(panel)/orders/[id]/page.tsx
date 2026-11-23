import { ArrowLeft, FileText, Phone, Mail, MapPin, CreditCard, Package, Clock, User, Undo2, AlertTriangle, Tag, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { inr, fdatetime } from "@/lib/util";
import { images } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import OrderControls from "@/components/admin/OrderControls";
import MarkPaid from "@/components/admin/MarkPaid";
import { StatusBadge } from "@/components/admin/ui";

const METHOD: Record<string, string> = { cod: "Cash on delivery", upi: "UPI / bank transfer", online: "Online · Razorpay" };
const TYPE: Record<string, string> = { simple: "Simple", variable: "Variant", combo: "Combo", digital: "Digital" };

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const o = await one("select * from orders where id = ?", [Number(params.id)]);
  if (!o) notFound();
  const [rows, events, ret, past, cust] = await Promise.all([
    all("select oi.*, p.images as p_images, p.slug as p_slug, p.stock as p_stock, p.status as p_status from order_items oi left join products p on p.id = oi.product_id where oi.order_id = ?", [o.id]),
    all("select * from order_events where order_id = ? order by id", [o.id]),
    one("select * from returns where order_id = ? order by id desc", [o.id]),
    o.customer_id ? one("select count(*) n, coalesce(sum(total),0) t from orders where customer_id = ? and status not in ('cancelled','returned')", [o.customer_id]) : null,
    o.customer_id ? one("select created_at from customers where id = ?", [o.customer_id]) : null,
  ]);
  const items = rows.map((i: any) => ({ ...i, img: i.image || (i.p_images ? images({ images: i.p_images, name: i.name })[0] : "") }));
  const units = items.reduce((a: number, i: any) => a + i.qty, 0);
  const timeline = events.length ? events : [{ id: 0, label: "Order placed", note: "", created_at: o.created_at }];
  const bulk = Number(o.bulk_discount || 0), coupon = Number(o.discount || 0) - bulk;
  const paid = o.payment_status === "paid";
  const address = [o.address, o.city, [o.state, o.pincode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const invoiceHref = `/invoice/${o.number}?t=${orderToken(o.number)}&back=${encodeURIComponent("/admin/orders/" + o.id)}`;
  const phone10 = String(o.phone || "").replace(/\D/g, "").slice(-10);
  const needsVerify = !paid && o.payment_method === "upi" && o.payment_ref && o.status !== "cancelled";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:underline"><ArrowLeft size={13} /> Orders</Link>
          <h1 className="h-serif flex flex-wrap items-center gap-2 text-3xl">{o.number} <StatusBadge s={o.status} /> <StatusBadge s={o.payment_status} /></h1>
          <p className="text-sm text-neutral-500">Placed {fdatetime(o.created_at)} · {units} item{units === 1 ? "" : "s"} · {inr(o.total)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={invoiceHref} target="_blank" className="btn"><FileText size={16} /> View invoice</a>
        </div>
      </div>

      {needsVerify && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-start gap-2"><AlertTriangle size={18} className="mt-0.5 shrink-0" /> Customer submitted UPI reference <b>{o.payment_ref}</b>. Check it in your bank / UPI app for <b>{inr(o.total)}</b>, then confirm.</p>
          <MarkPaid orderId={o.id} utr={o.payment_ref} />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* items */}
          <section className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-neutral-200 p-4"><Package size={17} className="text-plum" /><h2 className="font-semibold">Ordered items</h2><span className="text-xs text-neutral-500">{items.length} line{items.length === 1 ? "" : "s"} · {units} unit{units === 1 ? "" : "s"}</span></div>
            <div className="divide-y divide-neutral-100">
              {items.map((i: any) => (
                <div key={i.id} className="flex gap-4 p-4">
                  {i.img ? <img src={i.img} alt={i.name} className="h-20 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover" /> : <div className="h-20 w-20 shrink-0 rounded-lg bg-neutral-100" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        {i.product_id && i.p_slug ? <Link href={`/admin/products/${i.product_id}`} className="font-medium hover:underline">{i.name}</Link> : <p className="font-medium">{i.name}</p>}
                        {i.variant_name && <p className="text-sm text-neutral-600">{i.variant_name}</p>}
                      </div>
                      <p className="font-semibold">{inr(i.price * i.qty)}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <span>{inr(i.price)} × {i.qty}</span>
                      {i.sku && <span>SKU {i.sku}</span>}
                      <span className="badge bg-neutral-100 text-neutral-700">{TYPE[i.type] || i.type}</span>
                      {i.p_stock != null && i.type !== "digital" && i.type !== "combo" && <span>{i.p_stock} in stock now</span>}
                      {i.p_status === "draft" && <span className="text-amber-700">Product is draft</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ml-auto max-w-sm space-y-1.5 border-t border-neutral-200 p-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
              {bulk > 0 && <div className="flex justify-between text-green-700"><span className="inline-flex items-center gap-1"><Tag size={13} />{o.bulk_label || "Bulk discount"}</span><span>−{inr(bulk)}</span></div>}
              {coupon > 0 && <div className="flex justify-between text-green-700"><span className="inline-flex items-center gap-1"><Tag size={13} />Coupon {o.coupon_code}</span><span>−{inr(coupon)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{o.shipping ? inr(o.shipping) : "Free"}</span></div>
              {o.tax > 0 && <div className="flex justify-between text-neutral-500"><span>{Math.abs(o.total - (o.subtotal - o.discount + o.shipping)) < 0.02 ? "GST (included in price)" : "GST (added)"}</span><span>{inr(o.tax)}</span></div>}
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><span>Total</span><span>{inr(o.total)}</span></div>
              <div className={`flex justify-between text-xs ${paid ? "text-green-700" : "text-amber-700"}`}><span>{paid ? "Paid" : o.payment_method === "cod" ? "To collect on delivery" : "Payment due"}</span><span>{paid ? inr(o.total) : inr(o.total)}</span></div>
            </div>
          </section>

          {/* timeline */}
          <section className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><Clock size={17} className="text-plum" /> Order timeline</h2>
            <ol className="relative ml-2 space-y-4 border-l border-neutral-200 pl-5">
              {timeline.map((e: any, idx: number) => (
                <li key={e.id || idx} className="relative">
                  <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${idx === timeline.length - 1 ? "bg-plum" : "bg-neutral-300"}`} />
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="text-xs text-neutral-500">{fdatetime(e.created_at)}{e.note ? ` · ${e.note}` : ""}</p>
                </li>
              ))}
            </ol>
          </section>

          {ret && (
            <section className="card p-5 text-sm">
              <h2 className="mb-2 flex items-center gap-2 font-semibold"><Undo2 size={17} className="text-plum" /> Return request <StatusBadge s={ret.status} /></h2>
              <p><b>Reason:</b> {ret.reason || "—"}</p>
              {ret.details && <p className="mt-1 text-neutral-600">{ret.details}</p>}
              {ret.refund_amount > 0 && <p className="mt-1">Refund: <b>{inr(ret.refund_amount)}</b></p>}
              <Link href="/admin/returns" className="mt-2 inline-block text-xs underline">Manage in Returns & refunds</Link>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <OrderControls order={{ id: o.id, status: o.status, payment_status: o.payment_status, tracking: o.tracking, notes: o.notes, payment_method: o.payment_method, phone: o.phone, number: o.number }} />

          <section className="card space-y-2 p-5 text-sm">
            <h2 className="mb-1 flex items-center gap-2 font-semibold"><User size={17} className="text-plum" /> Customer</h2>
            <p className="font-medium">{o.name}</p>
            {o.phone && <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-neutral-700 hover:underline"><Phone size={14} />{o.phone}</a>}
            {o.email && <a href={`mailto:${o.email}`} className="flex items-center gap-2 break-all text-neutral-700 hover:underline"><Mail size={14} />{o.email}</a>}
            {past && <p className="border-t border-neutral-100 pt-2 text-xs text-neutral-500">{past.n} order{past.n === 1 ? "" : "s"} · {inr(past.t)} lifetime value{cust?.created_at ? ` · customer since ${fdatetime(cust.created_at).split(",")[0]}` : ""}{past.n <= 1 ? " · first-time buyer" : ""}</p>}
          </section>

          <section className="card space-y-2 p-5 text-sm">
            <h2 className="mb-1 flex items-center gap-2 font-semibold"><MapPin size={17} className="text-plum" /> Delivery address</h2>
            {address ? <><p className="font-medium">{o.name}</p><p className="text-neutral-700">{address}</p>{o.phone && <p className="text-neutral-500">Phone: {o.phone}</p>}</> : <p className="text-neutral-500">No shipping address (digital order).</p>}
            {o.tracking && <p className="flex items-center gap-2 border-t border-neutral-100 pt-2"><Truck size={14} /> Tracking: <b>{o.tracking}</b></p>}
            {o.notes && <p className="rounded-md bg-amber-50 p-2 text-amber-900"><b>Note:</b> {o.notes}</p>}
          </section>

          <section className="card space-y-1.5 p-5 text-sm">
            <h2 className="mb-1 flex items-center gap-2 font-semibold"><CreditCard size={17} className="text-plum" /> Payment</h2>
            <Line k="Method" v={METHOD[o.payment_method] || o.payment_method} />
            <Line k="Status" v={<StatusBadge s={o.payment_status} />} />
            <Line k="Amount" v={inr(o.total)} />
            {o.payment_ref && <Line k="UPI ref / UTR" v={<b className="break-all">{o.payment_ref}</b>} />}
            {o.gateway_order_id && <Line k="Gateway order" v={<span className="break-all text-xs">{o.gateway_order_id}</span>} />}
            {o.gateway_payment_id && <Line k="Gateway payment" v={<span className="break-all text-xs">{o.gateway_payment_id}</span>} />}
            {o.paid_at && <Line k="Paid on" v={fdatetime(o.paid_at)} />}
            {!paid && o.status !== "cancelled" && o.payment_method !== "cod" && <div className="pt-2"><MarkPaid orderId={o.id} utr={o.payment_ref} /></div>}
          </section>
        </div>
      </div>
    </div>
  );
}

const Line = ({ k, v }: { k: string; v: any }) => <div className="flex items-center justify-between gap-3"><span className="text-neutral-500">{k}</span><span className="text-right">{v}</span></div>;
