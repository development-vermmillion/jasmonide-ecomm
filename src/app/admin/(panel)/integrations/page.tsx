import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import FieldsForm from "@/components/admin/FieldsForm";
import { INTEGRATIONS } from "@/lib/site-fields";
import AlertTest from "@/components/admin/AlertTest";

export default async function Integrations() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Integrations</h1><p className="text-sm text-neutral-500">Sign-in, email, WhatsApp, shipping, other payment gateways, alerts and backups. Everything is optional — fill in only what you use, and change it any time.</p></div>
      <AlertTest />
      <FieldsForm groups={INTEGRATIONS} initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
