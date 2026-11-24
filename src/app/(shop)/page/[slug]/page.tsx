import { notFound } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import { Markdown } from "@/lib/md";
import { LEGAL_PAGES, fillLegal } from "@/lib/legal";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = LEGAL_PAGES.find((x) => x.slug === params.slug);
  return { title: p?.title || (params.slug === "contact" ? "Contact us" : "Page") };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const s = await getSettings();
  const legal = LEGAL_PAGES.find((x) => x.slug === params.slug);
  if (!legal && params.slug !== "contact") notFound();
  if (params.slug === "refund" && s.returns_enabled !== "1") notFound();
  if (params.slug === "contact" && s.contact_enabled !== "1") notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="h-serif text-3xl sm:text-4xl">{legal ? legal.title : "Contact us"}</h1>
      {legal ? <div className="mt-5 leading-relaxed text-neutral-700"><Markdown text={fillLegal(s[legal.key] || legal.def, s)} /></div>
        : <p className="mt-4 text-neutral-700">We'd love to hear from you.</p>}
      {params.slug === "contact" && (
        <div className="mt-6 space-y-1 text-sm"><p>{s.address}</p><p>{s.phone} · {s.email}</p>
          <a className="btn mt-4" href={`https://wa.me/${s.whatsapp}`} target="_blank">Chat on WhatsApp</a></div>
      )}
      {params.slug === "contact" && <ContactForm />}
    </div>
  );
}
