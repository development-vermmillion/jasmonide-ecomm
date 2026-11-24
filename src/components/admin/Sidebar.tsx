"use client";
import Link from "next/link";
import { LayoutDashboard, BarChart3, Package, Layers, FolderTree, Warehouse, Percent, ShoppingCart, Users, Ticket, Settings, UserCog, CreditCard, FileText, Film, Star, Plug, Scale, Megaphone, Radar, FileSpreadsheet, DatabaseBackup, Sparkles, Globe, Home, BookOpen, HelpCircle, Undo2, Inbox, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { canViewPage } from "@/lib/roles";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  ["Overview", [["/admin", "Dashboard", LayoutDashboard], ["/admin/reports", "Sales reports", BarChart3]]],
  ["Catalogue", [["/admin/products", "Products", Package], ["/admin/products?type=combo", "Combos", Layers], ["/admin/categories", "Categories", FolderTree], ["/admin/inventory", "Inventory & stock", Warehouse], ["/admin/offers", "Sales & offers", Percent], ["/admin/bulk", "Bulk discounts", Layers], ["/admin/import-export", "Import / export", FileSpreadsheet]]],
  ["Sales", [["/admin/orders", "Orders", ShoppingCart], ["/admin/customers", "Customers", Users], ["/admin/coupons", "Coupons", Ticket], ["/admin/payments", "Payments", CreditCard], ["/admin/sources", "Sources & carts", Radar], ["/admin/returns", "Returns & refunds", Undo2]]],
  ["Engagement", [["/admin/reels", "Instagram reels", Film], ["/admin/reviews", "Reviews", Star], ["/admin/assistant", "AI assistant", Sparkles], ["/admin/inbox", "Inbox & leads", Inbox]]],
  ["Store", [["/admin/homepage", "Homepage content", Home], ["/admin/brand", "Brand, SEO & AI", Globe], ["/admin/marketing", "Marketing & tools", Megaphone], ["/admin/legal", "Legal pages", Scale], ["/admin/blog", "Blog", BookOpen], ["/admin/faqs", "FAQs", HelpCircle], ["/admin/invoice-settings", "Invoice & GST", FileText], ["/admin/settings", "Settings & switches", Settings], ["/admin/integrations", "Integrations", Plug], ["/admin/backups", "Backups", DatabaseBackup], ["/admin/users", "Team & roles", UserCog]]],
] as const;

export default function Sidebar({ name, role, store, logo, counts }: { name: string; role: string; store: string; logo?: string; counts: Record<string, number> }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const active = (href: string) => {
    const base = href.split("?")[0];
    if (href.includes("type=combo")) return false;
    return base === "/admin" ? path === "/admin" : path.startsWith(base);
  };
  const body = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-3 pt-5">
        {logo ? <img src={logo} alt="" className="h-10 w-10 rounded-full border border-[var(--adm-line)] object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(17_17_20)] text-sm font-semibold text-white dark:bg-white dark:text-black">{(store || "J")[0]}</span>}
        <div className="min-w-0"><p className="truncate text-[15px] font-semibold leading-tight tracking-tight">{store}</p><p className="text-[11px] text-[var(--adm-muted)]">Admin workspace</p></div>
        <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
      </div>
      <div className="mx-5 border-t border-[var(--adm-line)]" />
      <nav className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV.map(([group, all]) => { const links = all.filter(([h]) => canViewPage(role, h.split("?")[0])); return links.length === 0 ? null : (
          <div key={group}>
            <p className="px-3 pb-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--adm-muted)]">{group}</p>
            {links.map(([href, label, Icon]) => {
              const on = active(href), n = counts[href.split("?")[0]] || 0;
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-[9px] text-[14px] transition-all duration-200 ${on ? "bg-[#f1ede6] font-medium text-[rgb(var(--c-ink))] dark:bg-white/10" : "text-[rgb(var(--c-ink)/.72)] hover:bg-[rgb(var(--c-ink)/.045)] hover:text-[rgb(var(--c-ink))]"}`}>
                  {on && <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--adm-accent)]" />}
                  <Icon size={17} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${on ? "text-[var(--adm-accent)]" : ""}`} />
                  <span className="truncate">{label}</span>
                  {n > 0 && <span className="ml-auto rounded-full bg-[rgb(var(--c-ink)/.08)] px-2 py-px text-[11px] font-medium">{n}</span>}
                </Link>
              );
            })}
          </div>
        ); })}
      </nav>
      <div className="m-3 rounded-2xl bg-[rgb(var(--c-ink)/.04)] p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--adm-accent-soft)] text-sm font-semibold text-[var(--adm-accent)]">{(name || "A")[0]}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium">{name}</p><p className="text-[11px] capitalize text-[var(--adm-muted)]">{role}</p></div>
          <button title="Sign out" aria-label="Sign out" className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[rgb(var(--c-ink)/.08)]"
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }}><LogOut size={15} /></button>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-[var(--adm-line)] bg-[rgb(var(--c-paper)/.85)] px-4 py-3 backdrop-blur lg:hidden">
        <p className="text-base font-semibold tracking-tight">{store} <span className="font-normal text-[var(--adm-muted)]">· Admin</span></p>
        <div className="flex items-center gap-1"><ThemeToggle /><button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center"><Menu size={22} /></button></div>
      </div>
      <div className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(false)} />
      <aside className={`no-print fixed bottom-3 left-3 top-3 z-50 w-[248px] rounded-[22px] border border-[var(--adm-line)] bg-[rgb(var(--c-surface))] shadow-[var(--adm-shadow)] transition-transform duration-300 ease-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-[120%]"}`}>{body}</aside>
    </>
  );
}
