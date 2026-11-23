import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { all, one } from "@/lib/db";
import { getSettings, images } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { upiLink } from "@/lib/payments";
import InvoiceSheet from "@/components/InvoiceSheet";
import PrintButton from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice", robots: { index: false, follow: false } };

export default async function InvoicePage({ params, searchParams }: { params: { number: string }; searchParams: { t?: string; back?: string } }) {
  if (searchParams.t !== orderToken(params.number)) notFound();
  const o = await one("select * from orders where number = ?", [params.number]);
  if (!o) notFound();
  const [rows, s] = await Promise.all([
    all("select oi.*, p.hsn, p.images as p_images, p.name as p_name from order_items oi left join products p on p.id = oi.product_id where oi.order_id = ?", [o.id]),
    getSettings(),
  ]);
  const items = rows.map((i: any) => ({ ...i, image: i.image || (i.p_images ? images({ images: i.p_images, name: i.name })[0] : "") }));
  const qr = o.payment_method === "upi" && o.payment_status !== "paid" && s.upi_id ? await QRCode.toDataURL(upiLink(s, o), { margin: 1, width: 240 }) : undefined;
  return (
    <div className="invoice-page min-h-screen bg-[#ece9f4] px-3 py-6 sm:px-6">
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link href={searchParams.back || `/order/${o.number}?t=${searchParams.t}`} className="inline-flex items-center gap-1 text-sm text-[#4b3b78] hover:underline"><ArrowLeft size={14} /> Back</Link>
        <PrintButton label="Print / Save as PDF" />
      </div>
      <InvoiceSheet o={o} items={items} s={s} qr={qr} />
    </div>
  );
}
