import { all, one } from "./db";
import { SITE_DEFAULTS, SECRET_KEYS } from "./site-fields";
import { FEATURE_DEFAULTS } from "./features";

export type Settings = Record<string, string>;

export const DEFAULT_SETTINGS: Settings = {
  store_name: "Jasmonoide",
  tagline: "Candles that feel like coming home",
  announcement: "Free shipping above ₹999 · Every order is packed by hand, with love",
  whatsapp: "919999999999",
  email: "hello@example.com",
  phone: "+91 99999 99999",
  address: "Your studio address, City, State, India",
  currency_symbol: "₹",
  shipping_flat: "79",
  free_shipping_min: "999",
  cod_enabled: "1",
  upi_enabled: "1",
  upi_id: "yourname@upi",
  bank_details: "Account name · A/C number · IFSC (placeholder)",
  hero_title: "Light a little warmth into every evening",
  hero_text: "Candles poured by hand, one small batch at a time — for slow evenings, shared laughter and the people who feel like home.",
  low_stock_default: "5",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
  logo_url: "", hero_image: "", promo1_image: "", promo2_image: "",
  reels_title: "Watch us pour", reels_handle: "@yourbrand", return_days: "7",
  maintenance_message: "We're making a few updates and will be back very soon.",
  ...SITE_DEFAULTS,
  ...FEATURE_DEFAULTS,
};

export async function getSettings(): Promise<Settings> {
  const rows = await all<{ key: string; value: string }>("select key, value from settings");
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) s[r.key] = r.value;
  // secrets never leave the server: expose only whether they are set
  for (const k of SECRET_KEYS) { s[k + "_set"] = s[k] || process.env[k.toUpperCase()] ? "1" : "0"; s[k] = ""; }
  return s;
}

/** Read a secret setting (server-only). Falls back to an env var such as RAZORPAY_KEY_SECRET. */
export async function getSecret(key: string): Promise<string> {
  const r = await one<{ value: string }>("select value from settings where key = ?", [key]);
  return r?.value || process.env[key.toUpperCase()] || "";
}

/* ---------- pricing ---------- */
const now = () => Date.now();
const parse = (d?: string | null) => (d ? new Date(d).getTime() : NaN);

export function saleActive(o: { sale_price?: number | null; price: number; sale_start?: string | null; sale_end?: string | null }) {
  if (o.sale_price == null || !(o.sale_price >= 0) || o.sale_price >= o.price) return false;
  const s = parse(o.sale_start), e = parse(o.sale_end);
  if (!isNaN(s) && now() < s) return false;
  if (!isNaN(e) && now() > e + 86399000) return false;
  return true;
}
export function unitPrice(o: any) {
  return saleActive(o) ? Number(o.sale_price) : Number(o.price);
}

/** Placeholder URLs carry a version so browsers never reuse an older cached picture. */
export const bust = (u: string) => (u && u.startsWith("/api/ph") && !u.includes("&v=") ? u + "&v=3" : u);

export function images(p: any): string[] {
  try {
    const a = JSON.parse(p.images || "[]");
    return a.length ? a.map(bust) : [placeholder(p.name)];
  } catch {
    return [placeholder(p.name)];
  }
}
export function placeholder(label: string, hue?: number) {
  const h = hue ?? [...(label || "x")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `/api/ph?t=${encodeURIComponent(label || "")}&h=${h}&v=3`;
}

/* ---------- hydration ---------- */
export type Product = any;

export async function hydrate(rows: any[]): Promise<Product[]> {
  if (!rows.length) return [];
  const S = await getSettings();
  const salesOn = S.sale_enabled === "1";
  const ids = rows.map((r) => r.id);
  const ph = ids.map(() => "?").join(",");
  const variants = await all(`select * from variants where product_id in (${ph}) order by id`, ids);
  const ratings = await all(`select product_id, avg(rating) as a, count(*) as n from reviews where status = 'approved' and product_id in (${ph}) group by product_id`, ids);
  const combos = rows.filter((r) => r.type === "combo").map((r) => r.id);
  let items: any[] = [];
  if (combos.length) {
    items = await all(
      `select ci.*, p.name as p_name, p.price as p_price, p.sale_price as p_sale, p.sale_start, p.sale_end, p.stock as p_stock, p.track_stock as p_track,
              v.name as v_name, v.price as v_price, v.sale_price as v_sale, v.stock as v_stock
       from combo_items ci join products p on p.id = ci.product_id left join variants v on v.id = ci.variant_id
       where ci.combo_id in (${combos.map(() => "?").join(",")}) order by ci.id`,
      combos
    );
  }
  return rows.map((r) => {
    const p: any = { ...r };
    if (!salesOn) p.sale_price = null;
    p.imgs = images(r);
    p.variants = variants.filter((v) => v.product_id === r.id).map((v) => (salesOn ? v : { ...v, sale_price: null }));
    const rt = ratings.find((x: any) => x.product_id === r.id);
    p.rating = rt ? Math.round(rt.a * 10) / 10 : 0;
    p.review_count = rt ? rt.n : 0;
    p.flags = { reviews: S.reviews_enabled === "1", wishlist: S.wishlist_enabled === "1", counter: S.stock_counter === "1", notify: S.notify_enabled === "1" };
    p.items = items.filter((i) => i.combo_id === r.id);
    // ----- display price -----
    if (r.type === "variable" && p.variants.length) {
      const prices = p.variants.map((v: any) => unitPrice({ ...v, sale_start: r.sale_start, sale_end: r.sale_end }));
      p.display_price = Math.min(...prices);
      p.from = new Set(prices).size > 1;
      p.on_sale = p.variants.some((v: any) => saleActive({ ...v, sale_start: r.sale_start, sale_end: r.sale_end }));
      p.strike = p.on_sale ? Math.min(...p.variants.map((v: any) => v.price)) : null;
    } else {
      p.on_sale = saleActive(p);
      p.display_price = unitPrice(p);
      p.strike = p.on_sale ? p.price : p.compare_at && p.compare_at > p.price ? p.compare_at : null;
    }
    // combo value = sum of components
    if (r.type === "combo") {
      const value = p.items.reduce((a: number, i: any) => a + (i.v_price ?? i.p_price) * i.qty, 0);
      p.combo_value = value;
      if (!p.on_sale && value > p.display_price) p.strike = value;
    }
    p.discount_pct = p.strike && p.strike > p.display_price ? Math.round((1 - p.display_price / p.strike) * 100) : 0;
    // ----- availability -----
    p.available = availableQty(p);
    p.in_stock = p.available > 0;
    return p;
  });
}

/** Returns Infinity-like (999999) for untracked, otherwise units available. */
export function availableQty(p: any): number {
  const INF = 999999;
  if (p.type === "digital") return INF;
  if (p.type === "variable") {
    return p.variants.reduce((a: number, v: any) => a + (p.track_stock ? Math.max(0, v.stock) : INF), 0);
  }
  if (p.type === "combo") {
    if (!p.items.length) return 0;
    return Math.min(
      ...p.items.map((i: any) => {
        const tracked = i.variant_id ? true : i.p_track;
        if (!tracked) return INF;
        const st = i.variant_id ? i.v_stock : i.p_stock;
        return Math.floor(Math.max(0, st) / Math.max(1, i.qty));
      })
    );
  }
  return p.track_stock ? Math.max(0, p.stock) : INF;
}

export type Query = {
  minPrice?: number; maxPrice?: number; inStock?: boolean;
  category?: string; type?: string; q?: string; sale?: boolean; featured?: boolean; sort?: string; limit?: number; offset?: number; includeDraft?: boolean; ids?: number[];
};

export async function getProducts(o: Query = {}): Promise<Product[]> {
  const where: string[] = [];
  const args: any[] = [];
  if (!o.includeDraft) where.push("p.status = 'published'");
  if (o.category) { where.push("c.slug = ?"); args.push(o.category); }
  if (o.type) { where.push("p.type = ?"); args.push(o.type); }
  if (o.featured) where.push("p.featured = 1");
  if (o.q) { where.push("(p.name like ? or p.tags like ? or p.short_desc like ?)"); args.push(`%${o.q}%`, `%${o.q}%`, `%${o.q}%`); }
  const S = await getSettings();
  if (!o.includeDraft && S.combos_enabled !== "1") where.push("p.type != 'combo'");
  if (o.ids?.length) { where.push(`p.id in (${o.ids.map(() => "?").join(",")})`); args.push(...o.ids); }
  const order =
    o.sort === "price-asc" ? "p.price asc" : o.sort === "price-desc" ? "p.price desc" : o.sort === "name" ? "p.name asc" : "p.id desc";
  const rows = await all(
    `select p.*, c.name as category_name, c.slug as category_slug from products p left join categories c on c.id = p.category_id
     ${where.length ? "where " + where.join(" and ") : ""} order by ${order}`,
    args
  );
  let list = await hydrate(rows);
  if (o.sale) list = list.filter((p) => p.on_sale);
  if (!o.includeDraft && S.show_sold_out === "0") list = list.filter((p) => p.in_stock);
  if (o.inStock) list = list.filter((p) => p.in_stock);
  if (o.minPrice != null) list = list.filter((p) => p.display_price >= o.minPrice!);
  if (o.maxPrice != null) list = list.filter((p) => p.display_price <= o.maxPrice!);
  if (o.sort === "price-asc") list.sort((a, b) => a.display_price - b.display_price);
  if (o.sort === "price-desc") list.sort((a, b) => b.display_price - a.display_price);
  if (o.offset) list = list.slice(o.offset);
  if (o.limit) list = list.slice(0, o.limit);
  return list;
}

export async function getProductBySlug(slug: string, includeDraft = false) {
  const row = await one(
    `select p.*, c.name as category_name, c.slug as category_slug from products p left join categories c on c.id = p.category_id where p.slug = ?`,
    [slug]
  );
  if (!row || (!includeDraft && row.status !== "published")) return null;
  if (!includeDraft && row.type === "combo" && (await getSettings()).combos_enabled !== "1") return null;
  return (await hydrate([row]))[0];
}
export async function getProductById(id: number) {
  const row = await one(
    `select p.*, c.name as category_name, c.slug as category_slug from products p left join categories c on c.id = p.category_id where p.id = ?`,
    [id]
  );
  return row ? (await hydrate([row]))[0] : null;
}
export const getCategories = async () =>
  (await all(`select c.*, (select count(*) from products p where p.category_id = c.id and p.status='published') as product_count from categories c order by sort, name`)).map((c: any) => ({ ...c, image: bust(c.image || "") }));

/** Products selectable inside a combo (simple + variable), with their variants. */
export async function comboPool() {
  const rows = await all("select id, name, price, type from products where type in ('simple','variable') order by name");
  const vars = await all("select id, product_id, name, price from variants order by id");
  return rows.map((p: any) => ({ id: p.id, name: p.name, price: p.price, type: p.type, variants: vars.filter((v: any) => v.product_id === p.id) }));
}
