"use client";
import Link from "next/link";
import { LayoutDashboard, BarChart3, Package, Layers, FolderTree, Warehouse, Percent, ShoppingCart, Users, Ticket, Settings, UserCog, CreditCard, FileText, Film, Star, Sparkles, Globe, Home, BookOpen, HelpCircle, Undo2, Inbox, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  ["Overview", [["/admin", "Dashboard", LayoutDashboard], ["/admin/reports", "Sales reports", BarChart3]]],
  ["Catalogue", [["/admin/products", "Products", Package], ["/admin/products?type=combo", "Combos", Layers], ["/admin/categories", "Categories", FolderTree], ["/admin/inventory", "Inventory & stock", Warehouse], ["/admin/offers", "Sales & offers", Percent], ["/admin/bulk", "Bulk discounts", Layers]]],
  ["Sales", [["/admin/orders", "Orders", ShoppingCart], ["/admin/customers", "Customers", Users], ["/admin/coupons", "Coupons", Ticket], ["/admin/payments", "Payments", CreditCard], ["/admin/returns", "Returns & refunds", Undo2]]],
  ["Engagement", [["/admin/reels", "Instagram reels", Film], ["/admin/reviews", "Reviews", Star], ["/admin/assistant", "AI assistant", Sparkles], ["/admin/inbox", "Inbox & leads", Inbox]]],
  ["Store", [["/admin/homepage", "Homepage content", Home], ["/admin/brand", "Brand, SEO & AI", Globe], ["/admin/blog", "Blog", BookOpen], ["/admin/faqs", "FAQs", HelpCircle], ["/admin/invoice-settings", "Invoice & GST", FileText], ["/admin/settings", "Settings & switches", Settings], ["/admin/users", "Team & users", UserCog]]],
] as const;

export default function Sidebar({ name, role, store }: { name: string; role: string; store: string }) {
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
      <div className="px-5 py-5"><p className="h-serif text-xl font-semibold">{store}</p><p className="text-[11px] uppercase tracking-widest text-neutral-400">Admin</p></div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map(([group, links]) => (
          <div key={group}>
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{group}</p>
            {links.map(([href, label, Icon]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${active(href) ? "bg-plum text-white" : "text-neutral-700 hover:bg-white/70"}`}>
                <Icon size={17} className="shrink-0" />{label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-neutral-200 p-4 text-sm">
        <div className="flex items-center justify-between"><div><p className="font-medium">{name}</p><p className="text-xs capitalize text-neutral-500">{role}</p></div><ThemeToggle /></div>
        <div className="mt-2 flex gap-3 text-xs">
          <a href="/" target="_blank" className="inline-flex items-center gap-1 underline"><ExternalLink size={13} />View store</a>
          <button className="inline-flex items-center gap-1 underline" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }}><LogOut size={13} />Sign out</button>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-lilac/70 px-4 py-3 lg:hidden">
        <p className="h-serif text-lg font-semibold">{store} · Admin</p>
        <button onClick={() => setOpen(true)} aria-label="Menu"><Menu size={24} /></button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 bg-lilac/60 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>{body}</aside>
    </>
  );
}
