import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import FieldsForm from "@/components/admin/FieldsForm";
import { BRAND_SEO, ASSISTANT } from "@/lib/site-fields";

export default async function Brand() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Brand, SEO & AI</h1><p className="text-sm text-neutral-500">Change your brand name, favicon, search-engine and AI-search details without touching code.</p></div>
      <FieldsForm groups={[...BRAND_SEO, ...ASSISTANT]} initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
