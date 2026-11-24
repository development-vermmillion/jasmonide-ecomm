import { WhatsAppIcon } from "@/components/social";
import { CheckCircle2, ArrowRight, PackageSearch, FileText } from "lucide-react";
import QRCode from "qrcode";
import PayPanel from "@/components/PayPanel";
import { upiLink, gatewayReady } from "@/lib/payments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { returnEligibility } from "@/lib/returns";
import ReturnForm from "@/components/ReturnForm";
import { inr, fdatetime } from "@/lib/util";

export const metadata = { title: "Order confirmed" };

export default async function OrderPage({ params, searchParams }: { params: { number: string }; searchParams: { t?: string; pay?: string } }) {
  if (searchParams.t !== orderToken(params.number)) notFound();
  const o = await one("select * from orders where number = ?", [params.number]);
  if (!o) notFound();
  const [items, s] = await Promise.all([all("select * from order_items where order_id = ?", [o.id]), getSettings()]);
  const online = await gatewayReady();
  let upi: any, bank: any[] = [];
  if (o.payment_method === "upi" && o.payment_status !== "paid") {
    const link = upiLink(s, o);
    upi = { id: s.upi_id, name: s.upi_payee_name || s.store_name, link, qr: await QRCode.toDataURL(link, { margin: 1, width: 360 }), customQr: s.upi_qr || "", note: s.upi_note, askRef: s.upi_require_ref === "1" };
    bank = [["Account name", s.bank_account_name], ["Bank", s.bank_name], ["Account no.", s.bank_account_no], ["IFSC", s.bank_ifsc], ["Branch", s.bank_branch]].filter(([, v]) => v).map(([label, value]) => ({ label, value }));
  }
  const ret = await one("select * from returns where order_id = ? order by id desc", [o.id]);
  const elig = returnEligibility(o, s, !!ret);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-green-700"><CheckCircle2 size={30} /></span>
      <p className="eyebrow">Thank you, {o.name?.split(" ")[0]}</p>
      <h1 className="h-serif mt-1 text-3xl sm:text-4xl">Your order is on its way to becoming a memory</h1>
      <p className="mt-3 text-neutral-600">Order <b>{o.number}</b> reached us on {fdatetime(o.created_at)}. As a new studio, every order means the world to us — we'll pack yours by hand, with love. Status: <b className="capitalize">{o.status}</b>.</p>

      {o.payment_status === "paid" && <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-sm font-medium text-green-800"><CheckCircle2 size={15} /> Payment received{o.payment_ref ? ` · Ref ${o.payment_ref}` : ""}</p>}
      {o.payment_status !== "paid" && o.status !== "cancelled" && (o.payment_method === "upi" || (o.payment_method === "online" && online)) && (
        <PayPanel number={o.number} token={searchParams.t!} method={o.payment_method} total={o.total} autostart={searchParams.pay === "1"} paymentRef={o.payment_ref}
          upi={upi} bank={bank} />
      )}
      {o.payment_method === "cod" && <p className="mt-3 text-sm text-neutral-600">Payment: cash on delivery — keep <b>{inr(o.total)}</b> ready.</p>}

      <div className="card mt-6 divide-y divide-neutral-100">
        {items.map((i: any) => (
          <div key={i.id} className="flex justify-between gap-4 p-4 text-sm">
            <span className="flex items-center gap-3">{i.image && <img src={i.image} alt="" className="h-12 w-12 rounded-md object-cover" />}<span>{i.name}{i.variant_name ? ` — ${i.variant_name}` : ""} × {i.qty}</span></span><span>{inr(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="space-y-1 p-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div>
          {o.bulk_discount > 0 && <div className="flex justify-between"><span>{o.bulk_label || "Bulk discount"}</span><span>−{inr(o.bulk_discount)}</span></div>}
          {o.discount - (o.bulk_discount || 0) > 0 && <div className="flex justify-between"><span>Discount {o.coupon_code && `(${o.coupon_code})`}</span><span>−{inr(o.discount - (o.bulk_discount || 0))}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{o.shipping ? inr(o.shipping) : "Free"}</span></div>
          {o.tax > 0 && <div className="flex justify-between text-neutral-500"><span>{s.tax_inclusive === "1" ? "Includes GST" : "GST"}</span><span>{inr(o.tax)}</span></div>}
          <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{inr(o.total)}</span></div>
        </div>
      </div>
      {o.address && <p className="mt-4 text-sm text-neutral-600">Shipping to: {o.name}, {o.address}, {o.city}, {o.state} {o.pincode} · {o.phone}</p>}
      {ret && <div className="mt-6 rounded-xl bg-sky/60 p-4 text-sm"><p className="font-semibold">Return request: <span className="capitalize">{ret.status}</span></p>{ret.admin_note && <p className="mt-1">{ret.admin_note}</p>}{ret.refund_amount > 0 && <p className="mt-1">Refund: {inr(ret.refund_amount)}</p>}</div>}
      {!ret && elig.ok && <div className="mt-6"><ReturnForm number={o.number} token={searchParams.t!} /></div>}
      <div className="mt-8 flex flex-wrap gap-3"><Link href={`/invoice/${o.number}?t=${searchParams.t}`} className="btn-outline"><FileText size={16} /> Invoice</Link><Link href="/shop" className="btn">Continue shopping <ArrowRight size={16} /></Link>{s.track_enabled === "1" && <Link href="/track" className="btn-outline"><PackageSearch size={16} /> Track order</Link>}</div>
    </div>
  );
}
