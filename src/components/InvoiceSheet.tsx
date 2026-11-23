import { buildInvoice } from "@/lib/invoice";
import { inr, fdatetime } from "@/lib/util";

const money = (n: number) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const METHOD: Record<string, string> = { cod: "Cash on delivery", upi: "UPI / bank transfer", online: "Online (Razorpay)" };

export default function InvoiceSheet({ o, items, s, qr }: { o: any; items: any[]; s: Record<string, string>; qr?: string }) {
  const inv = buildInvoice(o, items, s);
  const paid = o.payment_status === "paid";
  const accent = "text-[#4b3b78]";
  const seller = s.business_legal_name || s.store_name;
  const showImg = s.invoice_show_images === "1";
  const bank = [["Account name", s.bank_account_name], ["Bank", s.bank_name], ["A/C no.", s.bank_account_no], ["IFSC", s.bank_ifsc]].filter(([, v]) => v);
  const cancelled = o.status === "cancelled";
  return (
    <div className="invoice-sheet relative mx-auto w-full max-w-[210mm] overflow-hidden rounded-lg border border-[#e3dff0] bg-[#fff] p-6 text-[12px] leading-relaxed text-[#1f1b2e] shadow-sm sm:p-10">
      {(paid || cancelled) && (
        <div aria-hidden className={`pointer-events-none absolute right-10 top-36 -rotate-12 rounded-md border-4 px-4 py-1 text-3xl font-black tracking-widest opacity-25 ${cancelled ? "border-[#b91c1c] text-[#b91c1c]" : "border-[#15803d] text-[#15803d]"}`}>{cancelled ? "CANCELLED" : "PAID"}</div>
      )}

      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#4b3b78] pb-4">
        <div>
          {s.logo_url ? <img src={s.logo_url} alt={seller} className="mb-1 h-12 w-auto max-w-[200px] object-contain" /> : <p className={`font-serif text-2xl font-semibold ${accent}`}>{s.store_name}</p>}
          <p className="text-[11px] text-[#6b6580]">{s.tagline}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold uppercase tracking-wider ${accent}`}>{inv.title}</p>
          <p className="text-[11px] text-[#6b6580]">Original for recipient</p>
        </div>
      </div>

      {/* meta */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded-md bg-[#f6f3fc] p-3 sm:grid-cols-4">
        {[["Invoice no.", inv.invoiceNo], ["Invoice date", inv.invoiceDate], ["Order no.", o.number], ["Order placed", fdatetime(o.created_at)],
          ["Payment", METHOD[o.payment_method] || o.payment_method], ["Payment status", paid ? "Paid" : o.payment_status === "refunded" ? "Refunded" : "Pending"], ["Place of supply", inv.pos || "—"], ["Tracking", o.tracking || "—"]].map(([k, v]) => (
          <div key={k}><p className="text-[10px] uppercase tracking-wide text-[#6b6580]">{k}</p><p className="font-semibold">{v}</p></div>
        ))}
      </div>

      {/* parties */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${accent}`}>Sold by</p>
          <p className="font-semibold">{seller}</p>
          <p className="whitespace-pre-line text-[#4a4560]">{s.business_address || s.address}</p>
          <p className="text-[#4a4560]">{s.phone}{(s.business_email || s.email) && ` · ${s.business_email || s.email}`}</p>
          {s.gstin && <p className="mt-1 font-medium">GSTIN: {s.gstin}</p>}
          {s.pan && <p className="font-medium">PAN: {s.pan}</p>}
        </div>
        <div>
          <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${accent}`}>Billed to</p>
          <p className="font-semibold">{o.name}</p>
          {o.address ? <p className="text-[#4a4560]">{[o.address, o.city, [o.state, o.pincode].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</p> : <p className="text-[#4a4560]">Digital order — no postal address</p>}
          <p className="text-[#4a4560]">{o.phone}{o.email && ` · ${o.email}`}</p>
        </div>
        <div>
          <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${accent}`}>Shipped to</p>
          {o.address ? <><p className="font-semibold">{o.name}</p><p className="text-[#4a4560]">{[o.address, o.city, [o.state, o.pincode].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</p></> : <p className="text-[#4a4560]">Delivered digitally</p>}
        </div>
      </div>

      {/* items */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[11.5px]">
          <thead>
            <tr className="bg-[#4b3b78] text-left text-[#fff]">
              <th className="px-2 py-2">#</th><th className="px-2 py-2">Item</th><th className="px-2 py-2">HSN</th><th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate</th><th className="px-2 py-2 text-right">Taxable</th>{inv.tax > 0 && <th className="px-2 py-2 text-right">GST</th>}<th className="px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.lines.map((l: any, i: number) => (
              <tr key={l.id} className="border-b border-[#e9e5f3] align-top">
                <td className="px-2 py-2 text-[#6b6580]">{i + 1}</td>
                <td className="px-2 py-2">
                  <div className="flex items-start gap-2.5">
                    {showImg && l.image && <img src={l.image} alt="" className="h-11 w-11 shrink-0 rounded border border-[#e9e5f3] object-cover" />}
                    <div><p className="font-semibold">{l.name}</p>{l.variant_name && <p className="text-[#6b6580]">{l.variant_name}</p>}{l.sku && <p className="text-[10px] text-[#8a84a0]">SKU {l.sku}</p>}</div>
                  </div>
                </td>
                <td className="px-2 py-2">{l.hsn || "—"}</td>
                <td className="px-2 py-2 text-right">{l.qty}</td>
                <td className="px-2 py-2 text-right">{money(l.unitExTax)}</td>
                <td className="px-2 py-2 text-right">{money(l.taxable)}</td>
                {inv.tax > 0 && <td className="px-2 py-2 text-right">{money(l.tax)}<p className="text-[10px] text-[#8a84a0]">{inv.rate}%</p></td>}
                <td className="px-2 py-2 text-right font-semibold">{money(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* totals */}
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-md bg-[#f6f3fc] p-3"><p className="text-[10px] uppercase tracking-wide text-[#6b6580]">Amount in words</p><p className="font-semibold">{inv.words}</p></div>
          {inv.tax > 0 && (
            <table className="w-full border-collapse text-[11px]">
              <thead><tr className="border-b border-[#d8d2e8] text-left text-[#6b6580]"><th className="py-1">Tax summary</th><th className="py-1 text-right">Taxable</th><th className="py-1 text-right">Rate</th><th className="py-1 text-right">Tax</th></tr></thead>
              <tbody>
                {inv.intra ? (<>
                  <tr><td className="py-0.5">CGST</td><td className="text-right">{money(inv.taxable)}</td><td className="text-right">{inv.rate / 2}%</td><td className="text-right">{money(inv.cgst)}</td></tr>
                  <tr><td className="py-0.5">SGST</td><td className="text-right">{money(inv.taxable)}</td><td className="text-right">{inv.rate / 2}%</td><td className="text-right">{money(inv.sgst)}</td></tr>
                </>) : <tr><td className="py-0.5">IGST</td><td className="text-right">{money(inv.taxable)}</td><td className="text-right">{inv.rate}%</td><td className="text-right">{money(inv.tax)}</td></tr>}
              </tbody>
            </table>
          )}
        </div>
        <div className="space-y-1">
          <Row k="Item total" v={money(inv.subtotal)} />
          {o.bulk_discount > 0 && <Row k={o.bulk_label || "Bulk discount"} v={"−" + money(o.bulk_discount)} />}
          {o.discount - (o.bulk_discount || 0) > 0 && <Row k={`Coupon ${o.coupon_code || ""}`} v={"−" + money(o.discount - (o.bulk_discount || 0))} />}
          {inv.tax > 0 && <Row k="Taxable value" v={money(inv.taxable)} />}
          {inv.tax > 0 && (inv.intra ? <><Row k={`CGST @ ${inv.rate / 2}%`} v={money(inv.cgst)} /><Row k={`SGST @ ${inv.rate / 2}%`} v={money(inv.sgst)} /></> : <Row k={`IGST @ ${inv.rate}%`} v={money(inv.tax)} />)}
          <Row k="Shipping" v={inv.shipping ? money(inv.shipping) : "Free"} />
          {Math.abs(inv.roundOff) >= 0.01 && <Row k="Round off" v={money(inv.roundOff)} />}
          <div className="mt-1 flex justify-between border-t-2 border-[#4b3b78] pt-2 text-[15px] font-bold"><span>Grand total</span><span>{money(inv.total)}</span></div>
          {paid && <Row k="Amount paid" v={money(o.total)} />}
          {!paid && o.payment_method === "cod" && <Row k="To collect on delivery" v={money(o.total)} />}
          {!paid && o.payment_method !== "cod" && <Row k="Balance due" v={money(o.total)} />}
        </div>
      </div>

      {/* payment + terms */}
      <div className="mt-5 grid gap-5 border-t border-[#e9e5f3] pt-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div>
            <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${accent}`}>Payment details</p>
            <p>Method: <b>{METHOD[o.payment_method] || o.payment_method}</b> · Status: <b>{paid ? "Paid" : "Pending"}</b>{o.paid_at && ` on ${fdatetime(o.paid_at)}`}</p>
            {o.payment_ref && <p>Reference / UTR: <b>{o.payment_ref}</b></p>}
            {!paid && o.payment_method === "upi" && s.upi_id && <p>Pay to UPI ID: <b>{s.upi_id}</b></p>}
            {!paid && o.payment_method === "upi" && bank.length > 0 && <p className="text-[#4a4560]">{bank.map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
          </div>
          {s.invoice_terms && <div><p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${accent}`}>Terms & conditions</p><p className="whitespace-pre-line text-[11px] text-[#4a4560]">{s.invoice_terms}</p></div>}
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          {qr && !paid && <div className="text-center"><img src={qr} alt="UPI QR" className="h-24 w-24" /><p className="text-[10px] text-[#6b6580]">Scan to pay</p></div>}
          <div className="mt-auto w-44 text-center">
            {s.invoice_signature ? <img src={s.invoice_signature} alt="" className="mx-auto h-14 object-contain" /> : <div className="h-14" />}
            <p className="border-t border-[#b9b2d1] pt-1 text-[11px]">{s.invoice_signatory || "Authorised signatory"}</p>
            <p className="text-[10px] text-[#6b6580]">for {seller}</p>
          </div>
        </div>
      </div>

      <p className="mt-5 border-t border-[#e9e5f3] pt-3 text-center text-[11px] text-[#6b6580]">{s.invoice_footer} · This is a computer-generated invoice and does not require a physical signature.</p>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between text-[#3a3550]"><span>{k}</span><span>{v}</span></div>;
