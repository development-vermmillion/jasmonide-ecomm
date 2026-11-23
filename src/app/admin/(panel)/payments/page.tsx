import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import FieldsForm from "@/components/admin/FieldsForm";
import RazorpayTest from "@/components/admin/RazorpayTest";
import { PAYMENTS } from "@/lib/site-fields";

export default async function Payments() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  const upiOk = s.upi_enabled === "1" && !!s.upi_id && !s.upi_id.startsWith("yourname");
  const online = s.razorpay_enabled === "1";
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Payments</h1><p className="text-sm text-neutral-500">Control how customers can pay: COD, UPI / bank transfer and an online gateway.</p></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`rounded-xl p-4 text-sm ${s.cod_enabled === "1" ? "bg-mint/60" : "bg-neutral-100"}`}><p className="font-semibold">Cash on delivery</p><p className="text-xs">{s.cod_enabled === "1" ? "On" : "Off"}</p></div>
        <div className={`rounded-xl p-4 text-sm ${upiOk ? "bg-mint/60" : "bg-butter"}`}><p className="font-semibold">UPI / bank transfer</p><p className="text-xs">{upiOk ? `On · ${s.upi_id}` : s.upi_enabled === "1" ? "On — but UPI ID is still the placeholder" : "Off"}</p></div>
        <div className={`rounded-xl p-4 text-sm ${online && s.razorpay_key_id ? "bg-mint/60" : "bg-neutral-100"}`}><p className="font-semibold">Razorpay</p><p className="text-xs">{online ? (s.razorpay_key_id ? `On · ${s.razorpay_key_id.slice(0, 12)}…` : "On — but keys missing") : "Off"}</p></div>
      </div>
      <RazorpayTest />
      <FieldsForm groups={PAYMENTS} initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
