import { notFound } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import ContactForm from "@/components/ContactForm";

const PAGES: Record<string, [string, string]> = {
  shipping: ["Shipping policy", "Placeholder: We dispatch within 2–3 business days. Delivery usually takes 3–7 days across India. Free shipping above the amount set in Admin → Settings."],
  refund: ["Refund policy", "Placeholder: Unused products can be returned within 7 days of delivery. Digital products and opened chemicals are non-refundable. Replace this text with your policy."],
  privacy: ["Privacy policy", "Placeholder: We collect only the details needed to process and deliver your order. Replace this with your privacy policy."],
  terms: ["Terms of service", "Placeholder: By placing an order you agree to these terms. Replace this with your terms of service."],
  contact: ["Contact us", "We'd love to hear from you."],
};

export default async function Page({ params }: { params: { slug: string } }) {
  const p = PAGES[params.slug];
  if (!p) notFound();
  const s = await getSettings();
  if (params.slug === "refund" && s.returns_enabled !== "1") notFound();
  if (params.slug === "contact" && s.contact_enabled !== "1") notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="h-serif text-3xl sm:text-4xl">{p[0]}</h1>
      <p className="mt-4 leading-relaxed text-neutral-700">{p[1]}</p>
      {params.slug === "contact" && (
        <div className="mt-6 space-y-1 text-sm"><p>{s.address}</p><p>{s.phone} · {s.email}</p>
          <a className="btn mt-4" href={`https://wa.me/${s.whatsapp}`} target="_blank">Chat on WhatsApp</a></div>
      )}
      {params.slug === "contact" && <ContactForm />}
      {params.slug === "refund" && <p className="mt-3 text-sm text-neutral-600">Return window: {s.return_days} days after delivery. Request a return from your order page.</p>}
    </div>
  );
}
