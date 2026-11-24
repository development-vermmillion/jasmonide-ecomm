"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, PackageSearch, User, Heart, Tag, Gift, BookOpen } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { WhatsAppIcon } from "./social";

type Flags = { combos: boolean; sale: boolean; track: boolean; accounts: boolean; wishlist: boolean; theme: boolean; search: boolean; blog?: boolean };

export default function MobileMenu({ cats, flags, whatsapp, storeName }: { cats: { name: string; slug: string; image?: string }[]; flags: Flags; whatsapp?: string; storeName?: string }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const path = usePathname();
  const show = () => { setShown(true); requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true))); };
  const close = () => { setOpen(false); setTimeout(() => setShown(false), 320); };
  useEffect(() => { if (shown) close(); }, [path]); // eslint-disable-line
  useEffect(() => {
    if (!shown) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", key); };
  }, [shown]); // eslint-disable-line
  const quick = [
    flags.combos && { href: "/combos", label: "Combos", Icon: Gift },
    flags.sale && { href: "/sale", label: "Sale", Icon: Tag, tone: "text-clay" },
    flags.blog && { href: "/blog", label: "Journal", Icon: BookOpen },
    flags.wishlist && { href: "/wishlist", label: "Wishlist", Icon: Heart },
    flags.accounts && { href: "/account", label: "Account", Icon: User },
    flags.track && { href: "/track", label: "Track order", Icon: PackageSearch },
  ].filter(Boolean) as { href: string; label: string; Icon: any; tone?: string }[];
  let n = 0;
  return (
    <div className="lg:hidden">
      <button onClick={show} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-lilac/70"><Menu size={22} /></button>
      {shown && createPortal(
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Menu">
          <div onClick={close} className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
          <aside className={`absolute inset-y-0 left-0 flex w-[86%] max-w-[380px] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${open ? "translate-x-0" : "-translate-x-full"}`} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="h-serif text-xl font-semibold">{storeName || "Menu"}</span>
              <button onClick={close} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-lilac/70"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {flags.search && (
                <form action="/shop" className="mb-5">
                  <input name="q" placeholder="Search products" aria-label="Search" className="input !rounded-full !py-3 !pl-5" />
                </form>
              )}
              <p className="eyebrow mb-2">Shop</p>
              <ul className="space-y-1">
                <li className={open ? "rise" : ""} style={{ ["--i" as any]: n++ }}><Link href="/shop" className="flex items-center justify-between rounded-2xl bg-plum px-4 py-3.5 text-sm font-medium text-white">Shop everything <ChevronRight size={18} /></Link></li>
                {cats.map((c) => (
                  <li key={c.slug} className={open ? "rise" : ""} style={{ ["--i" as any]: n++ }}>
                    <Link href={`/category/${c.slug}`} className="flex items-center gap-3 rounded-2xl p-2 pr-3 transition active:bg-lilac/60">
                      {c.image ? <img src={c.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" /> : <span className="h-11 w-11 shrink-0 rounded-xl bg-lilac" />}
                      <span className="flex-1 text-[15px] font-medium">{c.name}</span><ChevronRight size={17} className="text-neutral-400" />
                    </Link>
                  </li>
                ))}
              </ul>
              {quick.length > 0 && (
                <>
                  <p className="eyebrow mb-2 mt-6">More</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {quick.map(({ href, label, Icon, tone }) => (
                      <li key={href} className={open ? "rise" : ""} style={{ ["--i" as any]: n++ }}>
                        <Link href={href} className={`flex items-center gap-2.5 rounded-2xl border border-neutral-200 px-3.5 py-3 text-sm font-medium transition active:bg-lilac/60 ${tone || ""}`}><Icon size={17} />{label}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3.5">
              {whatsapp ? <a href={`https://wa.me/${whatsapp}`} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium"><WhatsAppIcon size={18} className="text-[#25D366]" />Chat on WhatsApp</a> : <span />}
              {flags.theme && <ThemeToggle />}
            </div>
          </aside>
        </div>, document.body)}
    </div>
  );
}
