"use client";
import { Film, ArrowLeft, Upload, ChevronLeft, ChevronRight, Trash2, X, Plus, FileEdit, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { call, DeleteButton, Switch } from "./ui";
import { PRODUCT_TYPES, inr, slugify } from "@/lib/util";

const TYPE_HELP: Record<string, string> = {
  simple: "A single item with one price and one stock count.",
  variable: "One product with options (size, weight, colour…). Each option has its own price and stock.",
  combo: "A bundle of existing products sold at a bundle price. Stock is calculated from the items inside.",
  digital: "Courses, PDFs or downloads. No stock, no shipping.",
};

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mb-3 text-xs text-neutral-500">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </section>
  );
}
const Field = ({ label, children, className = "" }: any) => <div className={className}><label className="label">{label}</label>{children}</div>;

export default function ProductForm({ initial, categories, pool, id }: { initial: any; categories: any[]; pool: any[]; id?: number }) {
  const router = useRouter();
  const [f, setF] = useState<any>({ ...initial, sale_start: initial.sale_start || "", sale_end: initial.sale_end || "", sale_price: initial.sale_price ?? "", compare_at: initial.compare_at ?? "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const inp = (k: string) => ({ className: "input", value: f[k] ?? "", onChange: (e: any) => set(k, e.target.value) });

  /* images */
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setErr("");
    const fd = new FormData();
    Array.from(files).forEach((x) => fd.append("files", x));
    const r = await (await fetch("/api/admin/upload", { method: "POST", body: fd })).json();
    setUploading(false);
    if (r.error) return setErr(r.error);
    set("images", [...f.images, ...r.urls]);
  }
  const moveImg = (i: number, d: number) => { const a = [...f.images]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set("images", a); };

  /* variants */
  const addVariant = () => set("variants", [...f.variants, { name: "", sku: "", price: "", sale_price: "", stock: 0 }]);
  const upV = (i: number, k: string, v: any) => set("variants", f.variants.map((x: any, j: number) => (j === i ? { ...x, [k]: v } : x)));

  /* combo items */
  const addItem = () => set("items", [...f.items, { product_id: pool[0]?.id || "", variant_id: null, qty: 1 }]);
  const upI = (i: number, patch: any) => set("items", f.items.map((x: any, j: number) => (j === i ? { ...x, ...patch } : x)));
  const itemUnit = (it: any) => {
    const p = pool.find((x) => x.id === Number(it.product_id));
    if (!p) return 0;
    if (it.variant_id) return p.variants.find((v: any) => v.id === Number(it.variant_id))?.price || 0;
    return p.type === "variable" ? p.variants[0]?.price || 0 : p.price;
  };
  const comboValue = f.items.reduce((a: number, it: any) => a + itemUnit(it) * (Number(it.qty) || 1), 0);

  async function save(status?: string) {
    setBusy(true); setErr("");
    const body = { ...f, status: status || f.status };
    const r = id ? await call(`/api/admin/products/${id}`, "PUT", body) : await call("/api/admin/products", "POST", body);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    if (id) router.refresh(); else router.push(`/admin/products/${r.id}`);
    if (id) { setErr(""); window.scrollTo({ top: 0, behavior: "smooth" }); setSaved(true); setTimeout(() => setSaved(false), 2500); }
  }
  const [saved, setSaved] = useState(false);

  const isVar = f.type === "variable", isCombo = f.type === "combo", isDigital = f.type === "digital", isSimple = f.type === "simple";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:underline"><ArrowLeft size={13} /> Products</Link>
          <h1 className="h-serif text-3xl">{id ? "Edit product" : isCombo ? "New combo" : "New product"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-700">Saved ✓</span>}
          {id && <DeleteButton url={`/api/admin/products/${id}`} after="/admin/products" confirm="Delete this product permanently?" />}
          {id && <Link href={`/product/${f.slug}`} target="_blank" className="btn-outline">View</Link>}
          <button disabled={busy} onClick={() => save("draft")} className="btn-outline"><FileEdit size={15} /> Save as draft</button>
          <button disabled={busy} onClick={() => save("published")} className="btn">{busy ? "Saving…" : <><Save size={15} /> {id ? "Save & publish" : "Publish"}</>}</button>
        </div>
      </div>
      {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Product type">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(PRODUCT_TYPES).map(([k, label]) => (
                <label key={k} className={`cursor-pointer rounded-lg border p-3 text-sm ${f.type === k ? "border-plum bg-stone-150" : "border-neutral-200"} ${id && f.type !== k ? "opacity-60" : ""}`}>
                  <input type="radio" className="mr-2" checked={f.type === k} onChange={() => { set("type", k); if (k === "digital" || k === "combo") set("track_stock", 0); else set("track_stock", 1); if (k === "variable" && !f.variants.length) set("variants", [{ name: "", sku: "", price: "", sale_price: "", stock: 0 }]); }} />
                  <b>{label}</b><p className="ml-5 mt-0.5 text-xs text-neutral-500">{TYPE_HELP[k]}</p>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name *" className="sm:col-span-2"><input {...inp("name")} onChange={(e) => { set("name", e.target.value); if (!id) set("slug", slugify(e.target.value)); }} /></Field>
              <Field label="URL slug"><input {...inp("slug")} placeholder="auto-generated" /></Field>
              <Field label="Spec line (shown on cards)"><input {...inp("spec_line")} placeholder="e.g. 2:1 · Low viscosity" /></Field>
              <Field label="Short description" className="sm:col-span-2"><input {...inp("short_desc")} /></Field>
              <Field label="Description" className="sm:col-span-2"><textarea {...inp("description")} rows={6} /></Field>
            </div>
          </Section>

          <Section title="Images" hint="First image is the main one. Use JPG/PNG/WebP up to 8 MB each. Leave empty to show a placeholder.">
            <div className="flex flex-wrap gap-3">
              {f.images.map((u: string, i: number) => (
                <div key={u + i} className="w-28">
                  <img src={u} alt="" className="aspect-square w-full rounded-lg border border-neutral-200 object-cover" />
                  <div className="mt-1 flex justify-between text-xs">
                    <button type="button" aria-label="Move left" onClick={() => moveImg(i, -1)} disabled={i === 0} className="disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button type="button" className="text-red-600" aria-label="Remove image" onClick={() => set("images", f.images.filter((_: any, j: number) => j !== i))}><Trash2 size={15} /></button>
                    <button type="button" aria-label="Move right" onClick={() => moveImg(i, 1)} disabled={i === f.images.length - 1} className="disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                </div>
              ))}
              <label className="flex aspect-square w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-center text-xs text-neutral-500 hover:border-plum">
                {uploading ? "Uploading…" : <><Upload size={22} className="mb-1" />Upload</>}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <input id="imgurl" placeholder="…or paste an image URL" className="input" />
              <button type="button" className="btn-outline" onClick={() => { const el = document.getElementById("imgurl") as HTMLInputElement; if (el.value.trim()) { set("images", [...f.images, el.value.trim()]); el.value = ""; } }}>Add</button>
            </div>
          </Section>

          {/* ---- pricing per type ---- */}
          {(isSimple || isDigital || isCombo) && (
            <Section title="Pricing" hint={isCombo ? "Set the bundle price. The “value” is calculated from the products inside, so shoppers see what they save." : undefined}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label={isCombo ? "Bundle price (₹) *" : "Regular price (₹) *"}><input type="number" min="0" step="any" {...inp("price")} /></Field>
                <Field label="Sale price (₹)"><input type="number" min="0" step="any" {...inp("sale_price")} placeholder="Optional" /></Field>
                {!isCombo && <Field label="Compare-at / MRP (₹)"><input type="number" min="0" step="any" {...inp("compare_at")} placeholder="Optional strike-through" /></Field>}
                <Field label="Sale starts"><input type="date" {...inp("sale_start")} /></Field>
                <Field label="Sale ends"><input type="date" {...inp("sale_end")} /></Field>
              </div>
              <p className="mt-2 text-xs text-neutral-500">Leave the sale dates empty for an open-ended sale. The sale price only shows while the dates are active.</p>
            </Section>
          )}

          {isVar && (
            <Section title="Variants" hint="Each option (size, weight, colour…) has its own price, optional sale price and stock.">
              <div className="space-y-2">
                <div className="hidden grid-cols-12 gap-2 text-[11px] font-semibold uppercase text-neutral-500 sm:grid"><span className="col-span-3">Option name</span><span className="col-span-2">SKU</span><span className="col-span-2">Price</span><span className="col-span-2">Sale price</span><span className="col-span-2">Stock</span></div>
                {f.variants.map((v: any, i: number) => (
                  <div key={v.id || i} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-12">
                    <input className="input sm:col-span-3" placeholder="e.g. 1 kg" value={v.name} onChange={(e) => upV(i, "name", e.target.value)} />
                    <input className="input sm:col-span-2" placeholder="SKU" value={v.sku || ""} onChange={(e) => upV(i, "sku", e.target.value)} />
                    <input className="input sm:col-span-2" type="number" placeholder="Price" value={v.price} onChange={(e) => upV(i, "price", e.target.value)} />
                    <input className="input sm:col-span-2" type="number" placeholder="Sale" value={v.sale_price ?? ""} onChange={(e) => upV(i, "sale_price", e.target.value)} />
                    <input className="input sm:col-span-2" type="number" placeholder="Stock" value={v.stock} onChange={(e) => upV(i, "stock", e.target.value)} />
                    <button type="button" className="text-red-600 sm:col-span-1" onClick={() => set("variants", f.variants.filter((_: any, j: number) => j !== i))}><X size={16} /></button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-outline mt-3" onClick={addVariant}><Plus size={15} /> Add option</button>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Sale starts (applies to option sale prices)"><input type="date" {...inp("sale_start")} /></Field>
                <Field label="Sale ends"><input type="date" {...inp("sale_end")} /></Field>
              </div>
            </Section>
          )}

          {isCombo && (
            <Section title="Combo contents" hint="Pick the products (and options) bundled together. Stock is deducted from each item when a combo is sold.">
              {!pool.length && <p className="text-sm text-neutral-500">Create some simple or variable products first.</p>}
              <div className="space-y-2">
                {f.items.map((it: any, i: number) => {
                  const p = pool.find((x) => x.id === Number(it.product_id));
                  return (
                    <div key={i} className="grid grid-cols-12 items-center gap-2">
                      <select className="input col-span-5" value={it.product_id} onChange={(e) => upI(i, { product_id: Number(e.target.value), variant_id: null })}>
                        {pool.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                      </select>
                      {p?.type === "variable" ? (
                        <select className="input col-span-4" value={it.variant_id || ""} onChange={(e) => upI(i, { variant_id: e.target.value ? Number(e.target.value) : null })}>
                          <option value="">Choose option…</option>
                          {p.variants.map((v: any) => <option key={v.id} value={v.id}>{v.name} — {inr(v.price)}</option>)}
                        </select>
                      ) : <span className="col-span-4 text-sm text-neutral-500">{inr(p?.price)}</span>}
                      <input type="number" min="1" className="input col-span-2" value={it.qty} onChange={(e) => upI(i, { qty: e.target.value })} />
                      <button type="button" className="col-span-1 text-red-600" onClick={() => set("items", f.items.filter((_: any, j: number) => j !== i))}><X size={16} /></button>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="btn-outline mt-3" onClick={addItem} disabled={!pool.length}><Plus size={15} /> Add product</button>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-stone-150 p-3 text-sm">
                <span>Items value: <b>{inr(comboValue)}</b></span>
                <span className="text-neutral-400">|</span>
                {[10, 15, 20].map((d) => <button key={d} type="button" className="underline" onClick={() => set("price", Math.round(comboValue * (1 - d / 100)))}>Set price {d}% off</button>)}
              </div>
            </Section>
          )}

          {isDigital && (
            <Section title="Digital delivery">
              <Field label="Download / course link (shared after payment)"><input {...inp("digital_url")} placeholder="https://… (Google Drive, Vimeo, LMS)" /></Field>
            </Section>
          )}

          <Section title="Instagram reels for this product" hint="Shown on the product page so shoppers can watch it in use. Paste the reel link; add a thumbnail (optional).">
            <div className="space-y-3">
              {(f.reels || []).map((r: any, i: number) => (
                <div key={i} className="grid gap-2 rounded-lg bg-lilac/40 p-3 sm:grid-cols-6">
                  <input className="input sm:col-span-3" placeholder="https://www.instagram.com/reel/…" value={r.url || ""} onChange={(e) => set("reels", f.reels.map((x: any, j: number) => j === i ? { ...x, url: e.target.value } : x))} />
                  <input className="input sm:col-span-2" placeholder="Title" value={r.title || ""} onChange={(e) => set("reels", f.reels.map((x: any, j: number) => j === i ? { ...x, title: e.target.value } : x))} />
                  <button type="button" className="text-xs text-red-600 underline" onClick={() => set("reels", f.reels.filter((_: any, j: number) => j !== i))}>Remove</button>
                  <label className="flex cursor-pointer items-center gap-2 text-xs sm:col-span-6"><Upload size={13} /> {r.thumb ? "Thumbnail set ✓ (click to replace)" : "Upload thumbnail"}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const fl = e.target.files?.[0]; if (!fl) return;
                      const fd = new FormData(); fd.append("files", fl);
                      const u = await (await fetch("/api/admin/upload", { method: "POST", body: fd })).json();
                      if (u.urls) set("reels", f.reels.map((x: any, j: number) => j === i ? { ...x, thumb: u.urls[0] } : x));
                    }} /></label>
                </div>
              ))}
              <button type="button" className="btn-outline" onClick={() => set("reels", [...(f.reels || []), { url: "", title: "", thumb: "" }])}><Film size={15} /> Add reel</button>
            </div>
          </Section>

          <Section title="Search engine listing (SEO)">
            <div className="grid gap-3"><Field label="SEO title"><input {...inp("seo_title")} /></Field><Field label="Meta description"><textarea rows={2} {...inp("seo_desc")} /></Field></div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Organisation">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-mint/50 p-3 text-sm">
                <div><p className="font-medium">{f.status === "published" ? "Active" : "Draft"}</p><p className="text-xs text-neutral-500">{f.status === "published" ? "Visible in the store" : "Hidden from customers"}</p></div>
                <Switch on={f.status === "published"} label="Active or draft" onChange={(v) => set("status", v ? "published" : "draft")} />
              </div>
              <Field label="Category"><select className="input" value={f.category_id || ""} onChange={(e) => set("category_id", e.target.value)}><option value="">— None —</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Tags (comma separated)"><input {...inp("tags")} /></Field>
              <Field label="Badge label"><input {...inp("badge")} placeholder="New, Bestseller, Festive…" /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.featured} onChange={(e) => set("featured", e.target.checked ? 1 : 0)} /> Featured / bestseller</label>
            </div>
          </Section>

          {!isCombo && !isDigital && (
            <Section title="Inventory">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.track_stock} onChange={(e) => set("track_stock", e.target.checked ? 1 : 0)} /> Track stock quantity</label>
                {isSimple && f.track_stock ? <Field label="Stock on hand"><input type="number" {...inp("stock")} /></Field> : null}
                <Field label="Low-stock alert at"><input type="number" {...inp("low_stock")} /></Field>
                {isSimple && <Field label="SKU"><input {...inp("sku")} /></Field>}
                <Field label="Weight (grams)"><input type="number" {...inp("weight_g")} /></Field>
                <Field label="HSN code (printed on GST invoice)"><input placeholder="e.g. 3406 for candles" {...inp("hsn")} /></Field>
              </div>
            </Section>
          )}
          {isCombo && <Section title="Inventory"><p className="text-sm text-neutral-600">Combo stock is automatic: it equals the number of full bundles your item stock can make.</p><Field label="SKU" className="mt-3"><input {...inp("sku")} /></Field><Field label="HSN code (printed on GST invoice)" className="mt-3"><input placeholder="e.g. 3406" {...inp("hsn")} /></Field></Section>}
        </div>
      </div>
    </div>
  );
}
