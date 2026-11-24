import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import { canEditContent } from "@/lib/roles";
import FieldsForm from "@/components/admin/FieldsForm";
import { LEGAL } from "@/lib/site-fields";
import { LEGAL_PAGES } from "@/lib/legal";
import Link from "next/link";

export default async function Legal() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Legal pages</h1><p className="text-sm text-neutral-500">Privacy, terms, shipping, refund and cookie policies — sample text is ready; edit it any time. View live:{" "}
        {LEGAL_PAGES.map((p, i) => <span key={p.slug}>{i > 0 && " · "}<Link className="underline" target="_blank" href={`/page/${p.slug}`}>{p.title}</Link></span>)}</p></div>
      <FieldsForm groups={LEGAL} initial={s} canEdit={canEditContent(me?.role)} />
    </div>
  );
}
