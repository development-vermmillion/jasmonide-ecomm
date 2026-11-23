import { Download, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { all } from "@/lib/db";
import { getProducts, getCategories } from "@/lib/catalog";
import ProductsTable from "@/components/admin/ProductsTable";
import { PRODUCT_TYPES } from "@/lib/util";

export default async function ProductsPage({ searchParams }: { searchParams: { q?: string; type?: string; category?: string; status?: string } }) {
  const [cats, products] = await Promise.all([getCategories(), getProducts({ includeDraft: true, q: searchParams.q, type: searchParams.type, category: searchParams.category })]);
  const list = searchParams.status ? products.filter((p: any) => p.status === searchParams.status) : products;
  const counts = await all("select type, count(*) n from products group by type");
  const rows = list.map((p: any) => ({
    id: p.id, name: p.name, slug: p.slug, image: p.imgs[0], type: p.type, category: p.category_name || "—", status: p.status, featured: p.featured,
    price: p.display_price, strike: p.strike, from: p.from, on_sale: p.on_sale, available: p.available, track: p.type === "digital" ? 0 : 1, sku: p.sku, variants: p.variants.length, items: p.items.length,
  }));
  const isCombo = searchParams.type === "combo";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">{isCombo ? "Combos" : "Products"}</h1><p className="text-sm text-neutral-500">{rows.length} shown</p></div>
        <div className="flex gap-2">
          <a href="/api/admin/export/products" className="btn-outline"><Download size={16} /> Export CSV</a>
          <Link href={`/admin/products/new${isCombo ? "?type=combo" : ""}`} className="btn"><Plus size={16} /> Add {isCombo ? "combo" : "product"}</Link>
        </div>
      </div>
      <form className="card flex flex-wrap items-center gap-2 p-3">
        <input name="q" defaultValue={searchParams.q} placeholder="Search name, tag…" className="input max-w-xs" />
        <select name="type" defaultValue={searchParams.type || ""} className="input w-auto">
          <option value="">All types</option>
          {Object.entries(PRODUCT_TYPES).map(([k, v]) => <option key={k} value={k}>{v} ({counts.find((c: any) => c.type === k)?.n || 0})</option>)}
        </select>
        <select name="category" defaultValue={searchParams.category || ""} className="input w-auto">
          <option value="">All categories</option>
          {cats.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={searchParams.status || ""} className="input w-auto">
          <option value="">Any status</option><option value="published">Published</option><option value="draft">Draft</option>
        </select>
        <button className="btn"><Filter size={15} /> Filter</button>
        <Link href="/admin/products" className="text-sm underline">Reset</Link>
      </form>
      <ProductsTable rows={rows} />
    </div>
  );
}
