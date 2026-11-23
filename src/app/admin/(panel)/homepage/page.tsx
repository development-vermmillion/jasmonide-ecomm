import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import FieldsForm from "@/components/admin/FieldsForm";
import { HOME } from "@/lib/site-fields";

export default async function HomeContent() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Homepage content</h1><p className="text-sm text-neutral-500">Edit every heading, text, image and link on the home page. Product rails fill themselves from your catalogue; reels are in Instagram reels.</p></div>
      <FieldsForm groups={HOME} initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
