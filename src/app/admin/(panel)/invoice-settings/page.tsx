import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import FieldsForm from "@/components/admin/FieldsForm";
import { BUSINESS } from "@/lib/site-fields";

export default async function InvoiceSettings() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Invoice & GST</h1><p className="text-sm text-neutral-500">Your legal details, GST and layout for printed invoices. Open any order and press “Invoice” to preview.</p></div>
      <FieldsForm groups={BUSINESS} initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
