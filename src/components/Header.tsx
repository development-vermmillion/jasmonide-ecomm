import Link from "next/link";
import { all } from "@/lib/db";
import { getSettings, getCategories, images, placeholder } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";
import { PackageSearch, User } from "lucide-react";
import { CartButton } from "./CartDrawer";
import MobileMenu from "./MobileMenu";
import SearchBox from "./SearchBox";
import ThemeToggle from "./ThemeToggle";
import HeaderShell from "./HeaderShell";
import { MegaMenu, NavLink } from "./HeaderNav";
import { WishlistLink } from "./wishlist";
import { WhatsAppIcon } from "./social";

const iconBtn = "hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-lilac/70";

export default async function Header() {
  const [s, cats, feat, me] = await Promise.all([
    getSettings(),
    getCategories(),
    all(`select id, name, slug, images, category_id, type, price, sale_price,
           (select min(coalesce(v.sale_price, v.price)) from variants v where v.product_id = products.id) as vmin
         from products where status='published' order by featured desc, id desc limit 120`),
    getCustomer(),
  ]);
  const f = {
    combos: s.combos_enabled === "1", sale: s.sale_enabled === "1", track: s.track_enabled === "1", accounts: s.accounts_enabled === "1",
    wishlist: s.wishlist_enabled === "1", theme: s.theme_toggle_enabled === "1", search: s.search_enabled === "1", blog: s.blog_enabled === "1",
  };
  const mega = cats.map((c: any) => ({
    id: c.id, name: c.name, slug: c.slug, description: c.description || "", count: c.product_count ?? 0, image: c.image || placeholder(c.name),
    products: feat.filter((p: any) => p.category_id === c.id).slice(0, 4).map((p: any) => {
      const variable = p.type === "variable";
      return { id: p.id, name: p.name, slug: p.slug, image: images(p)[0], from: variable, price: variable ? Number(p.vmin ?? 0) : Number(p.sale_price || p.price) };
    }),
  }));
  const quick = mega.filter((c: any) => c.count > 0).slice(0, 3);

  const announcement = s.announcement_enabled === "1" ? (
    <div className="bg-lilac px-4 py-2 text-center text-[11.5px] leading-snug text-ink sm:text-xs">
      <span>{s.announcement}</span>
      {s.whatsapp && <a href={`https://wa.me/${s.whatsapp}`} target="_blank" className="ml-3 hidden whitespace-nowrap font-medium underline underline-offset-2 sm:inline"><WhatsAppIcon size={13} className="mr-1 inline" />Bulk Order Enquiries</a>}
    </div>
  ) : null;

  return (
    <HeaderShell announcement={announcement}>
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 sm:px-6 lg:h-[72px] lg:grid-cols-[auto_1fr_auto] lg:gap-6">
        <div className="justify-self-start lg:hidden"><MobileMenu cats={mega.map((c: any) => ({ name: c.name, slug: c.slug, image: c.image }))} flags={f} whatsapp={s.whatsapp} storeName={s.store_name} /></div>

        <Link href="/" aria-label={s.store_name} className="h-serif flex items-center justify-self-center text-[22px] font-semibold tracking-tight sm:text-2xl lg:justify-self-start">
          {s.logo_url ? <img src={s.logo_url} alt={s.store_name} className="h-8 w-auto max-w-[150px] object-contain sm:h-9" /> : s.store_name}
        </Link>

        <nav aria-label="Main" className="hidden h-full items-center justify-center gap-0.5 lg:flex">
          <MegaMenu cats={mega} />
          {quick.map((c: any) => <span key={c.id} className="hidden xl:block"><NavLink href={`/category/${c.slug}`}>{c.name}</NavLink></span>)}
          {f.combos && <NavLink href="/combos">Combos</NavLink>}
          {f.sale && <NavLink href="/sale" tone="sale">Sale</NavLink>}
          {f.blog && <NavLink href="/blog">Journal</NavLink>}
        </nav>

        <div className="flex items-center gap-0.5 justify-self-end sm:gap-1">
          {f.search && <SearchBox cats={mega.map((c: any) => ({ name: c.name, slug: c.slug }))} />}
          {f.track && <Link href="/track" aria-label="Track order" title="Track order" className={`${iconBtn} xl:flex`}><PackageSearch size={19} /></Link>}
          {f.wishlist && <span className="hidden sm:block"><WishlistLink /></span>}
          {f.accounts && <Link href={me ? "/account" : "/account/login"} aria-label="Account" title={me ? me.name : "Sign in"} className={`${iconBtn} sm:flex`}><User size={19} className={me ? "text-plum" : ""} /></Link>}
          {f.theme && <span className="hidden sm:block"><ThemeToggle /></span>}
          <span className="ml-1"><CartButton /></span>
        </div>
      </div>
    </HeaderShell>
  );
}
