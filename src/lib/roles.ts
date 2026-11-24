/** Staff roles. Pure data + helpers (safe to import from middleware and client code). */
export type Area = "dashboard" | "orders" | "catalogue" | "content" | "settings";

export const ROLES: Record<string, { label: string; desc: string; areas: Area[]; readOnly?: boolean }> = {
  owner: { label: "Owner", desc: "Everything, including settings, team, integrations and backups.", areas: ["dashboard", "orders", "catalogue", "content", "settings"] },
  manager: { label: "Manager", desc: "Runs the shop day to day: orders, products and content. Cannot change settings, integrations, team or backups.", areas: ["dashboard", "orders", "catalogue", "content"] },
  orders: { label: "Orders & support", desc: "Orders, customers, returns, inbox and sources. Cannot edit products or content.", areas: ["dashboard", "orders"] },
  catalogue: { label: "Catalogue & stock", desc: "Products, categories, inventory, offers, coupons, import/export.", areas: ["dashboard", "catalogue"] },
  content: { label: "Content editor", desc: "Homepage, blog, FAQs, reels, reviews, legal pages and marketing text.", areas: ["dashboard", "content"] },
  viewer: { label: "View only", desc: "Can look at everything except settings, but cannot change anything.", areas: ["dashboard", "orders", "catalogue", "content"], readOnly: true },
};
export const roleOf = (r?: string) => (r && ROLES[r] ? r : r === "staff" ? "manager" : "viewer");

const PAGE_AREA: [string, Area][] = [
  ["/admin/reports", "dashboard"], ["/admin/insights", "dashboard"], ["/admin/heatmap", "dashboard"],
  ["/admin/orders", "orders"], ["/admin/customers", "orders"], ["/admin/returns", "orders"], ["/admin/inbox", "orders"], ["/admin/payments", "orders"], ["/admin/sources", "orders"], ["/admin/gift-cards", "orders"], ["/admin/subscriptions", "orders"],
  ["/admin/products", "catalogue"], ["/admin/categories", "catalogue"], ["/admin/inventory", "catalogue"], ["/admin/offers", "catalogue"], ["/admin/bulk", "catalogue"], ["/admin/coupons", "catalogue"], ["/admin/import-export", "catalogue"],
  ["/admin/homepage", "content"], ["/admin/blog", "content"], ["/admin/faqs", "content"], ["/admin/reels", "content"], ["/admin/reviews", "content"], ["/admin/assistant", "content"], ["/admin/legal", "content"], ["/admin/marketing", "content"],
  ["/admin/brand", "settings"], ["/admin/settings", "settings"], ["/admin/invoice-settings", "settings"], ["/admin/integrations", "settings"], ["/admin/users", "settings"], ["/admin/backups", "settings"], ["/admin/loyalty", "settings"],
];
const API_AREA: Record<string, Area> = {
  orders: "orders", giftcards: "orders", subscriptions: "orders", insights: "dashboard", payments: "orders", returns: "orders", inbox: "orders", sources: "orders", customers: "orders",
  products: "catalogue", categories: "catalogue", coupons: "catalogue", stock: "catalogue", bulk: "catalogue", sale: "catalogue", import: "catalogue",
  blog: "content", faqs: "content", reels: "content", reviews: "content", assistant: "content",
  settings: "content", toggle: "settings", backups: "settings", alerts: "settings",
};

export function pageArea(path: string): Area | null {
  if (path === "/admin") return "dashboard";
  for (const [p, a] of PAGE_AREA) if (path === p || path.startsWith(p + "/")) return a;
  return null;
}
export function canViewPage(role: string, path: string) {
  const a = pageArea(path);
  return !a || ROLES[roleOf(role)].areas.includes(a);
}
/** `/api/admin/<seg>/...` permission check. */
export function canCallApi(role: string, path: string, method: string) {
  const r = ROLES[roleOf(role)];
  const seg = path.split("/")[3] || "";
  if (r.readOnly && method !== "GET") return seg === "users" && path.split("/").length > 4 && method === "PUT"; // may change own password
  if (seg === "users") return method === "PUT" || role === "owner";
  if (seg === "export") return true;
  if (seg === "upload") return true;
  const a = API_AREA[seg];
  return !a || r.areas.includes(a);
}

export const canEditContent = (role?: string) => { const r = ROLES[roleOf(role)]; return r.areas.includes("content") && !r.readOnly; };
