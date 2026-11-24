import { NextResponse } from "next/server";
import { all, one, run } from "@/lib/db";
import { parseCSV, slugify } from "@/lib/util";
import { saveProduct } from "@/lib/products-admin";

/** CSV upload (raw text body). Matches existing products by slug, then SKU; creates new simple/digital products; updates simple/digital ones. */
export async function POST(req: Request) {
  const rows = parseCSV(await req.text());
  if (!rows.length) return NextResponse.json({ ok: false, error: "The file is empty or isn't a CSV" }, { status: 400 });
  if (!("name" in rows[0])) return NextResponse.json({ ok: false, error: "Missing a “name” column. Download the template to see the format." }, { status: 400 });
  if (rows.length > 2000) return NextResponse.json({ ok: false, error: "Please upload at most 2000 rows at a time" }, { status: 400 });
  let created = 0, updated = 0;
  const notes: string[] = [];
  const cats = new Map<string, number>((await all("select id, name from categories")).map((c: any) => [String(c.name).toLowerCase(), c.id]));
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], line = i + 2;
    try {
      if (!r.name) throw new Error("name is empty");
      const ex: any = (r.slug && (await one("select * from products where slug = ?", [r.slug]))) || (r.sku && (await one("select * from products where sku = ?", [r.sku]))) || null;
      if (ex && ex.type !== "simple" && ex.type !== "digital") throw new Error(`“${ex.name}” has options/combo items — edit it in Products`);
      const type = ex ? ex.type : (r.type || "simple");
      if (!ex && type !== "simple" && type !== "digital") throw new Error("only simple and digital products can be created by import");
      let category_id = ex?.category_id ?? null;
      if (r.category) {
        const k = r.category.toLowerCase();
        if (!cats.has(k)) { const c = await run("insert into categories (name, slug) values (?,?)", [r.category, slugify(r.category)]); cats.set(k, c.id); }
        category_id = cats.get(k)!;
      }
      const has = (k: string) => k in r && r[k] !== "";
      const base: any = ex ? { ...ex, images: JSON.parse(ex.images || "[]"), track_stock: ex.track_stock, featured: !!ex.featured } : { type, status: "published", track_stock: 1, low_stock: 5, images: [] };
      const b = { ...base, name: r.name, category_id, type };
      for (const k of ["short_desc", "spec_line", "description", "tags", "sku", "badge", "hsn", "seo_title", "seo_desc"]) if (k in r && (!ex || r[k] !== "")) b[k] = r[k];
      for (const k of ["price", "compare_at", "sale_price", "stock", "low_stock", "weight_g"]) if (has(k)) { if (isNaN(Number(r[k]))) throw new Error(`${k} must be a number`); b[k] = Number(r[k]); }
      if (!ex && !has("price")) throw new Error("price is required for new products");
      if (has("status")) b.status = r.status.toLowerCase() === "draft" ? "draft" : "published";
      if (has("featured")) b.featured = ["1", "yes", "true"].includes(r.featured.toLowerCase());
      if (has("images")) b.images = r.images.split("|").map((x) => x.trim()).filter(Boolean);
      if (ex && r.slug === "") b.slug = ex.slug; else if (r.slug) b.slug = r.slug;
      await saveProduct(b, ex?.id);
      ex ? updated++ : created++;
    } catch (e: any) { if (notes.length < 25) notes.push(`Row ${line}: ${e.message}`); }
  }
  return NextResponse.json({ ok: true, created, updated, skipped: rows.length - created - updated, notes });
}
