import { getProducts, getSettings, saleActive } from "./catalog";

export type FeedRow = { id: string; group: string; title: string; description: string; link: string; image: string; availability: string; price: string; sale_price: string; brand: string; category: string; ptype: string; weight: string };

const plain = (t: string) => (t || "").replace(/[#*_>`]/g, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
const money = (n: number) => `${Number(n).toFixed(2)} INR`;

export async function feedRows(): Promise<{ rows: FeedRow[]; base: string; ok: boolean; cat: string }> {
  const s = await getSettings();
  const base = (s.site_url || "").startsWith("http") ? s.site_url.replace(/\/$/, "") : "";
  const abs = (u: string) => (u.startsWith("http") ? u : base + (u.startsWith("/") ? u : "/" + u));
  const list = (await getProducts({})).filter((p: any) => p.type !== "digital");
  const rows: FeedRow[] = [];
  for (const p of list) {
    const common = { title: p.name, description: plain(p.short_desc || p.spec_line || p.description).slice(0, 4900) || p.name, link: `${base}/product/${p.slug}`, image: abs(p.imgs[0] || ""), brand: s.feed_brand || s.store_name, category: s.feed_google_category, ptype: p.category_name || "", weight: p.weight_g ? `${p.weight_g} g` : "" };
    if (p.type === "variable" && p.variants?.length) {
      for (const v of p.variants) {
        const on = p.salesOn !== false && saleActive({ sale_price: v.sale_price, price: v.price, sale_start: p.sale_start, sale_end: p.sale_end });
        rows.push({ ...common, id: `P${p.id}-V${v.id}`, group: `P${p.id}`, title: `${p.name} - ${v.name}`, availability: !p.track_stock || v.stock > 0 ? "in stock" : "out of stock", price: money(v.price), sale_price: on ? money(v.sale_price) : "" });
      }
    } else {
      rows.push({ ...common, id: p.sku || `P${p.id}`, group: "", availability: p.in_stock ? "in stock" : "out of stock", price: money(p.strike || p.display_price), sale_price: p.strike ? money(p.display_price) : "" });
    }
  }
  return { rows, base, ok: s.feeds_enabled === "1", cat: s.feed_google_category };
}
