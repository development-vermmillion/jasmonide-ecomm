import { notFound } from "next/navigation";
import { all } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export const metadata = { title: "FAQ", description: "Answers to common questions about orders, shipping, payments and returns." };
export default async function Faq() {
  if ((await getSettings()).faq_enabled !== "1") notFound();
  const faqs = await all("select * from faqs where active = 1 order by sort, id");
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f: any) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) };
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="eyebrow">Help</p><h1 className="h-serif mt-1 text-3xl sm:text-4xl">Frequently asked questions</h1>
      <div className="mt-6 space-y-2">{faqs.map((f: any) => <details key={f.id} className="card p-4"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{f.answer}</p></details>)}</div>
      {!faqs.length && <p className="py-16 text-center text-neutral-500">No questions yet.</p>}
    </div>
  );
}
