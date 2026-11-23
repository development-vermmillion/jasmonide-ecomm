import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { getSettings, getCategories } from "@/lib/catalog";
import { InstagramIcon, YoutubeIcon, WhatsAppIcon } from "./social";
import NewsletterForm from "./NewsletterForm";

export default async function Footer() {
  const [s, cats] = await Promise.all([getSettings(), getCategories()]);
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-peach/60">
      {s.newsletter_enabled === "1" && (
        <div className="border-b border-neutral-200/70 bg-lilac/60">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center">
            <div><p className="h-serif text-2xl">{s.newsletter_title}</p><p className="text-sm text-neutral-600">{s.newsletter_text}</p></div>
            <div className="w-full md:w-96"><NewsletterForm /></div>
          </div>
        </div>
      )}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="h-serif text-2xl font-semibold">{s.store_name}</p>
          <p className="mt-3 text-sm text-neutral-600">{s.footer_about || s.tagline}</p>
          <div className="mt-4 flex gap-2">
            {[[s.instagram, "Instagram", <InstagramIcon key="i" size={18} />], [s.youtube, "YouTube", <YoutubeIcon key="y" size={18} />], [`https://wa.me/${s.whatsapp}`, "WhatsApp", <WhatsAppIcon key="w" size={18} />]].map(([href, label, icon]: any) => (
              <a key={label} href={href} target="_blank" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-plum shadow-sm transition hover:-translate-y-0.5 hover:bg-plum hover:text-white">{icon}</a>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Shop</p>
          <ul className="space-y-2 text-sm">
            {cats.slice(0, 7).map((c: any) => <li key={c.id}><Link href={`/category/${c.slug}`} className="hover:underline">{c.name}</Link></li>)}
            {s.combos_enabled === "1" && <li><Link href="/combos" className="hover:underline">Combos</Link></li>}
            {s.sale_enabled === "1" && <li><Link href="/sale" className="hover:underline">Sale</Link></li>}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Help</p>
          <ul className="space-y-2 text-sm">
            {s.accounts_enabled === "1" && <li><Link href="/account" className="hover:underline">My account</Link></li>}
            {s.track_enabled === "1" && <li><Link href="/track" className="hover:underline">Track your order</Link></li>}
            {s.wishlist_enabled === "1" && <li><Link href="/wishlist" className="hover:underline">Wishlist</Link></li>}
            {s.blog_enabled === "1" && <li><Link href="/blog" className="hover:underline">Blog</Link></li>}
            {s.faq_enabled === "1" && <li><Link href="/faq" className="hover:underline">FAQ</Link></li>}
            <li><Link href="/page/shipping" className="hover:underline">Shipping policy</Link></li>
            {s.returns_enabled === "1" && <li><Link href="/page/refund" className="hover:underline">Return &amp; refund policy</Link></li>}
            <li><Link href="/page/privacy" className="hover:underline">Privacy policy</Link></li>
            <li><Link href="/page/terms" className="hover:underline">Terms of service</Link></li>
            <li><Link href="/page/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Contact</p>
          <ul className="space-y-2.5 text-sm text-neutral-700">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-plum" />{s.address}</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-plum" />{s.phone}</li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-plum" />{s.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200/70 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {s.store_name}. All rights reserved. · <Link href="/admin" className="underline">Admin</Link>
      </div>
    </footer>
  );
}
