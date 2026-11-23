import { all } from "@/lib/db";
import FaqManager from "@/components/admin/FaqManager";

export default async function Faqs() {
  const rows = await all("select * from faqs order by sort, id");
  return <div className="space-y-5"><div><h1 className="h-serif text-3xl">FAQs</h1><p className="text-sm text-neutral-500">Shown on /faq, fed to Google (FAQ schema), AI search (llms.txt) and your AI assistant.</p></div><FaqManager rows={rows} /></div>;
}
