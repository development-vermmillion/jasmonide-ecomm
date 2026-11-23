import { all, one, run } from "./db";
import { slugify } from "./util";

const num = (v: any, d = 0) => (v === "" || v == null || isNaN(Number(v)) ? d : Number(v));
const numOrNull = (v: any) => (v === "" || v == null || isNaN(Number(v)) ? null : Number(v));

async function uniqueSlug(base: string, ignoreId?: number) {
  let slug = slugify(base), n = 1;
  while (true) {
    const ex = await one("select id from products where slug = ?", [slug]);
    if (!ex || ex.id === ignoreId) return slug;
    slug = `${slugify(base)}-${++n}`;
  }
}

export async function saveProduct(b: any, id?: number) {
  if (!b.name?.trim()) throw new Error("Product name is required");
  const type = ["simple", "variable", "combo", "digital"].includes(b.type) ? b.type : "simple";
  const variants: any[] = type === "variable" ? (b.variants || []).filter((v: any) => v.name?.trim()) : [];
  const items: any[] = type === "combo" ? (b.items || []).filter((i: any) => i.product_id) : [];
  if (type === "variable" && !variants.length) throw new Error("Add at least one variant (e.g. size or option)");
  if (type === "combo" && !items.length) throw new Error("Add at least one product to the combo");
  if (items.some((i) => Number(i.product_id) === id)) throw new Error("A combo cannot contain itself");

  let price = num(b.price);
  if (type === "variable") price = Math.min(...variants.map((v) => num(v.price)));
  let compare_at = numOrNull(b.compare_at);
  if (type === "combo") {
    let value = 0;
    for (const i of items) {
      const unit = i.variant_id
        ? (await one("select price from variants where id = ?", [i.variant_id]))?.price
        : (await one("select price from products where id = ?", [i.product_id]))?.price;
      value += (unit || 0) * Math.max(1, num(i.qty, 1));
    }
    compare_at = value;
  }
  const slug = await uniqueSlug(b.slug || b.name, id);
  const vals = [
    type, b.name.trim(), slug, b.short_desc || "", b.spec_line || "", b.description || "",
    b.category_id ? Number(b.category_id) : null, b.tags || "", JSON.stringify(b.images || []),
    price, compare_at, numOrNull(b.sale_price), b.sale_start || null, b.sale_end || null,
    b.sku || "", Math.floor(num(b.stock)), Math.floor(num(b.low_stock, 5)), b.track_stock ? 1 : 0,
    b.status === "draft" ? "draft" : "published", b.featured ? 1 : 0, b.badge || "", b.digital_url || "",
    Math.floor(num(b.weight_g)), b.seo_title || "", b.seo_desc || "",
  ];
  const cols = "type,name,slug,short_desc,spec_line,description,category_id,tags,images,price,compare_at,sale_price,sale_start,sale_end,sku,stock,low_stock,track_stock,status,featured,badge,digital_url,weight_g,seo_title,seo_desc".split(",");

  let pid = id!;
  if (id) {
    const old = await one("select stock, type from products where id = ?", [id]);
    await run(`update products set ${cols.map((c) => c + " = ?").join(", ")}, updated_at = datetime('now') where id = ?`, [...vals, id]);
    if (old && type === "simple" && old.stock !== Math.floor(num(b.stock)))
      await run("insert into stock_log (product_id,delta,balance,reason) values (?,?,?,?)", [id, Math.floor(num(b.stock)) - old.stock, Math.floor(num(b.stock)), "Edited in product form"]);
  } else {
    const r = await run(`insert into products (${cols.join(",")}) values (${cols.map(() => "?").join(",")})`, vals);
    pid = r.id;
    if (type === "simple" && num(b.stock) > 0)
      await run("insert into stock_log (product_id,delta,balance,reason) values (?,?,?,?)", [pid, Math.floor(num(b.stock)), Math.floor(num(b.stock)), "Opening stock"]);
  }

  // variants
  if (id) {
    const keep = variants.filter((v) => v.id).map((v) => Number(v.id));
    const existing = await all("select id from variants where product_id = ?", [pid]);
    for (const e of existing) if (!keep.includes(e.id)) await run("delete from variants where id = ?", [e.id]);
  }
  for (const v of variants) {
    const vv = [v.name.trim(), v.sku || "", num(v.price), numOrNull(v.sale_price), Math.floor(num(v.stock))];
    if (v.id) {
      const old = await one("select stock from variants where id = ?", [v.id]);
      await run("update variants set name=?, sku=?, price=?, sale_price=?, stock=? where id = ?", [...vv, v.id]);
      if (old && old.stock !== vv[4]) await run("insert into stock_log (product_id,variant_id,delta,balance,reason) values (?,?,?,?,?)", [pid, v.id, (vv[4] as number) - old.stock, vv[4], "Edited in product form"]);
    } else {
      const r = await run("insert into variants (product_id,name,sku,price,sale_price,stock) values (?,?,?,?,?,?)", [pid, ...vv]);
      if (vv[4]) await run("insert into stock_log (product_id,variant_id,delta,balance,reason) values (?,?,?,?,?)", [pid, r.id, vv[4], vv[4], "Opening stock"]);
    }
  }
  if (type !== "variable") await run("delete from variants where product_id = ?", [pid]);

  // combo items
  await run("delete from combo_items where combo_id = ?", [pid]);
  for (const i of items)
    await run("insert into combo_items (combo_id,product_id,variant_id,qty) values (?,?,?,?)", [pid, Number(i.product_id), i.variant_id ? Number(i.variant_id) : null, Math.max(1, Math.floor(num(i.qty, 1)))]);

  // Instagram reels attached to this product (shown on its page and, optionally, the home page)
  if (Array.isArray(b.reels)) {
    const keep = b.reels.filter((r: any) => r.id).map((r: any) => Number(r.id));
    const ex = await all("select id from reels where product_id = ?", [pid]);
    for (const e of ex) if (!keep.includes(e.id)) await run("delete from reels where id = ?", [e.id]);
    for (const r of b.reels) {
      if (!String(r.url || "").trim() && !String(r.video_url || "").trim()) continue;
      if (r.id) await run("update reels set title=?, url=?, thumb=?, video_url=? where id=?", [r.title || "", r.url || "", r.thumb || "", r.video_url || "", Number(r.id)]);
      else await run("insert into reels (title,url,thumb,video_url,product_id,show_home,status) values (?,?,?,?,?,1,'active')", [r.title || "", r.url || "", r.thumb || "", r.video_url || "", pid]);
    }
  }
  return { id: pid, slug };
}
