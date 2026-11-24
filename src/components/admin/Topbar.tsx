"use client";
import { Bell, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const TITLES: Record<string, string> = {
  "": "Dashboard", reports: "Sales reports", products: "Products", categories: "Categories", inventory: "Inventory & stock", offers: "Sales & offers", bulk: "Bulk discounts",
  orders: "Orders", customers: "Customers", coupons: "Coupons", payments: "Payments", returns: "Returns & refunds", reels: "Instagram reels", reviews: "Reviews",
  assistant: "AI assistant", inbox: "Inbox & leads", homepage: "Homepage content", brand: "Brand, SEO & AI", blog: "Blog", faqs: "FAQs",
  "invoice-settings": "Invoice & GST", settings: "Settings & switches", users: "Team & users",
};

export default function Topbar({ open }: { open: number }) {
  const path = usePathname();
  const seg = path.split("/").filter(Boolean).slice(1);
  const title = TITLES[seg[0] || ""] || "Admin";
  return (
    <div className="no-print mb-5 hidden items-center justify-between lg:flex">
      <div className="crumb">
        <span>Workspace</span><span className="opacity-40">/</span>
        <Link href={`/admin${seg[0] ? "/" + seg[0] : ""}`} className="font-medium text-[rgb(var(--c-ink))]">{title}</Link>
        {seg[1] && <><span className="opacity-40">/</span><span className="font-medium text-[rgb(var(--c-ink))]">{seg[1] === "new" ? "New" : "#" + seg[1]}</span></>}
      </div>
      <div className="flex items-center gap-1.5">
        <a href="/" target="_blank" className="btn-outline !py-1.5 text-[13px]"><ExternalLink size={14} /> View store</a>
        <ThemeToggle className="border border-[var(--adm-line)] bg-[rgb(var(--c-surface))]" />
        <Link href="/admin/orders" aria-label="Open orders" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--adm-line)] bg-[rgb(var(--c-surface))] transition hover:border-[var(--adm-accent)]">
          <Bell size={17} />
          {open > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--adm-accent)] px-1 text-[10px] font-semibold text-white">{open > 9 ? "9+" : open}</span>}
        </Link>
      </div>
    </div>
  );
}
