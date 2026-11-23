import Link from "next/link";
import { all } from "@/lib/db";
import { getSettings, getCategories, placeholder } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";
import { ArrowRight, ChevronDown, PackageSearch, User } from "lucide-react";
import { CartButton } from "./CartDrawer";
import MobileMenu from "./MobileMenu";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import { WishlistLink } from "./wishlist";
import { WhatsAppIcon } from "./social";

export default async function Header() {
  const [s, cats, feat, me] = await Promise.all([
    getSettings(),
    getCategories(),
    all(`select id, name, slug, images, category_id from products where status='published' order by featured desc, id desc limit 80`),
    getCustomer(),
  ]);
  const f = {
    combos: s.combos_enabled === "1", sale: s.sale_enabled === "1", track: s.track_enabled === "1", accounts: s.accounts_enabled === "1",
    wishlist: s.wishlist_enabled === "1", theme: s.theme_toggle_enabled === "1", search: s.search_enabled === "1", blog: s.blog_enabled === "1",
  };
  const by = (cid: number) => feat.filter((p: any) => p.category_id === cid).slice(0, 3);
  const img = (p: any) => { try { return JSON.parse(p.images)[0] || placeholder(p.name); } catch { return placeholder(p.name); } };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-paper/95 backdrop-blur">
      {s.announcement_enabled === "1" && (
        <div className="bg-lilac px-4 py-2 text-center text-xs text-ink">
          {s.announcement}{" "}
          <a href={`https://wa.me/${s.whatsapp}`} target="_blank" className="ml-2 underline underline-offset-2"><WhatsAppIcon size={13} className="mr-1 inline" />Bulk Order Enquiries</a>
        </div>
      )}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <MobileMenu cats={cats.map((c: any) => ({ name: c.name, slug: c.slug }))} flags={f} />
        <Link href="/" className="h-serif flex items-center text-2xl font-semibold tracking-tight">
          {s.logo_url ? <img src={s.logo_url} alt={s.store_name} className="h-8 w-auto max-w-[150px] object-contain sm:h-9" /> : s.store_name}
        </Link>
        <nav className="hidden min-w-0 items-center gap-3 lg:flex xl:gap-5">
          {cats.slice(0, 7).map((c: any) => (
            <div key={c.id} className="group static">
              <Link href={`/category/${c.slug}`} className="inline-flex items-center gap-1 whitespace-nowrap py-6 text-[13px] font-medium hover:text-clay xl:text-sm">{c.name}<ChevronDown size={14} className="opacity-50 transition group-hover:rotate-180" /></Link>
              <div className="invisible absolute left-0 right-0 top-full translate-y-2 border-b border-neutral-200 bg-paper opacity-0 shadow-lg transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-6 py-6">
                  <div>
                    <p className="eyebrow">{c.name}</p>
                    <p className="mt-2 text-sm text-neutral-600">{c.description}</p>
                    <Link href={`/category/${c.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline">Shop all {c.name} <ArrowRight size={14} /></Link>
                  </div>
                  {by(c.id).map((p: any) => (
                    <Link key={p.id} href={`/product/${p.slug}`} className="block">
                      <img src={img(p)} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                      <p className="mt-2 text-sm font-medium">{p.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {f.combos && <Link href="/combos" className="text-sm font-medium hover:text-clay">Combos</Link>}
          {f.sale && <Link href="/sale" className="text-sm font-medium text-clay">Sale</Link>}
          {s.blog_enabled === "1" && <Link href="/blog" className="text-sm font-medium hover:text-clay">Blog</Link>}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {f.search && <SearchBox />}
          {f.track && <Link href="/track" aria-label="Track order" title="Track order" className="hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10 sm:flex"><PackageSearch size={19} /></Link>}
          {f.wishlist && <WishlistLink />}
          {f.accounts && <Link href={me ? "/account" : "/account/login"} aria-label="Account" title={me ? me.name : "Sign in"} className="hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10 sm:flex"><User size={19} className={me ? "text-plum" : ""} /></Link>}
          {f.theme && <span className="hidden sm:block"><ThemeToggle /></span>}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
