import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function Settings() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Store settings</h1><p className="text-sm text-neutral-500">Branding, shipping, tax, payments and homepage text.</p></div>
      <SettingsForm initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
