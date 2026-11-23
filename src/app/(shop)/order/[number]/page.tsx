import { WhatsAppIcon } from "@/components/social";
import { CheckCircle2, ArrowRight, PackageSearch } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { returnEligibility } from "@/lib/returns";
import ReturnForm from "@/components/ReturnForm";
import { inr, fdatetime } from "@/lib/util";

export const metadata = { title: "Order confirmed" };

export default async function OrderPage({ params, searchParams }: { params: { number: string }; searchParams: { t?: string } }) {
  if (searchParams.t !== orderToken(params.number)) notFound();
  const o = await one("select * from orders where number = ?", [params.number]);
  if (!o) notFound();
  const [items, s] = await Promise.all([all("select * from order_items where order_id = ?", [o.id]), getSettings()]);
  const ret = await one("select * from returns where order_id = ? order by id desc", [o.id]);
  const elig = returnEligibility(o, s, !!ret);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-green-700"><CheckCircle2 size={30} /></span>
      <p className="eyebrow">Thank you, {o.name?.split(" ")[0]}</p>
      <h1 className="h-serif mt-1 text-3xl sm:text-4xl">Order {o.number} placed</h1>
      <p className="mt-2 text-neutral-600">We've received your order on {fdatetime(o.created_at)}. Status: <b className="capitalize">{o.status}</b>.</p>

      {o.payment_method === "upi" && o.payment_status !== "paid" && (
        <div className="mt-6 rounded-xl border border-clay/30 bg-clay-soft p-5 text-sm">
          <p className="font-semibold">Complete your payment</p>
          <p className="mt-1">Pay <b>{inr(o.total)}</b> via UPI to <b>{s.upi_id}</b> and mention order <b>{o.number}</b>.</p>
          <p className="mt-1 text-xs text-neutral-600">{s.bank_details}</p>
          <a className="btn-clay mt-3" target="_blank" href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Hi, I've paid for order ${o.number}`)}`}><WhatsAppIcon size={16} /> Share payment screenshot on WhatsApp</a>
        </div>
      )}

      <div className="card mt-6 divide-y divide-neutral-100">
        {items.map((i: any) => (
          <div key={i.id} className="flex justify-between gap-4 p-4 text-sm">
            <span>{i.name}{i.variant_name ? ` — ${i.variant_name}` : ""} × {i.qty}</span><span>{inr(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="space-y-1 p-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
          {o.bulk_discount > 0 && <div className="flex justify-between"><span>{o.bulk_label || "Bulk discount"}</span><span>−{inr(o.bulk_discount)}</span></div>}
          {o.discount - (o.bulk_discount || 0) > 0 && <div className="flex justify-between"><span>Discount {o.coupon_code && `(${o.coupon_code})`}</span><span>−{inr(o.discount - (o.bulk_discount || 0))}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{o.shipping ? inr(o.shipping) : "Free"}</span></div>
          {o.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{inr(o.tax)}</span></div>}
          <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{inr(o.total)}</span></div>
        </div>
      </div>
      {o.address && <p className="mt-4 text-sm text-neutral-600">Shipping to: {o.name}, {o.address}, {o.city}, {o.state} {o.pincode} · {o.phone}</p>}
      {ret && <div className="mt-6 rounded-xl bg-sky/60 p-4 text-sm"><p className="font-semibold">Return request: <span className="capitalize">{ret.status}</span></p>{ret.admin_note && <p className="mt-1">{ret.admin_note}</p>}{ret.refund_amount > 0 && <p className="mt-1">Refund: {inr(ret.refund_amount)}</p>}</div>}
      {!ret && elig.ok && <div className="mt-6"><ReturnForm number={o.number} token={searchParams.t!} /></div>}
      <div className="mt-8 flex gap-3"><Link href="/shop" className="btn">Continue shopping <ArrowRight size={16} /></Link>{s.track_enabled === "1" && <Link href="/track" className="btn-outline"><PackageSearch size={16} /> Track order</Link>}</div>
    </div>
  );
}
