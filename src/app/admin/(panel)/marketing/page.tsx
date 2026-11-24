import { Copy } from "lucide-react";
import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import { canEditContent } from "@/lib/roles";
import FieldsForm from "@/components/admin/FieldsForm";
import { MARKETING } from "@/lib/site-fields";

export default async function Marketing() {
  const [s, me] = await Promise.all([getSettings(), getSession()]);
  const base = (s.site_url || "").startsWith("http") ? s.site_url : "https://YOUR-SITE";
  const feeds = [["Google Merchant Center (Google Shopping)", `${base}/feeds/google.xml`], ["Meta Commerce Manager — Instagram/Facebook Shop & WhatsApp Catalogue", `${base}/feeds/meta.csv`]];
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Marketing & tools</h1><p className="text-sm text-neutral-500">Tracking, Instagram feed, WhatsApp shopping, product feeds, mood quiz and gift-box builder.</p></div>
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold">Your product feed links</h2>
        <p className="text-xs text-neutral-500">Paste these in Google Merchant Center → Products → Feeds (scheduled fetch) and in Meta Commerce Manager → Catalog → Data sources → Scheduled feed. WhatsApp Business uses the same Meta catalogue.</p>
        {feeds.map(([l, u]) => <div key={u} className="rounded-lg bg-lilac/40 p-3 text-sm"><p className="font-medium">{l}</p><code className="break-all text-xs">{u}</code></div>)}
        {!(s.site_url || "").startsWith("http") && <p className="text-xs text-amber-700">Set your real “Website address” in Brand & SEO so the links above (and the feed's product links) are correct.</p>}
      </section>
      <FieldsForm groups={MARKETING} initial={s} canEdit={canEditContent(me?.role)} />
    </div>
  );
}
