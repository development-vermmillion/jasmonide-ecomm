"use client";
import { useState } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportExport() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<any>(null);
  async function upload(f?: File) {
    if (!f) return;
    setBusy(true); setRes(null);
    const r = await (await fetch("/api/admin/import/products", { method: "POST", body: await f.text() })).json().catch(() => ({ ok: false, error: "Upload failed" }));
    setBusy(false); setRes(r); router.refresh();
  }
  const dl = [["products", "All products", "Edit prices & stock in Excel/Sheets, then import it back"], ["inventory", "Inventory (incl. variants)", "Stock levels per product and option"], ["orders", "Orders", "All orders with totals and status"], ["customers", "Customers", "With orders count and total spent"], ["subscribers", "Newsletter subscribers", "Emails of everyone who joined"]];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold"><Download size={17} /> Export (download CSV)</h2>
        <div className="divide-y divide-neutral-100">{dl.map(([k, t, d]) => <div key={k} className="flex items-center justify-between gap-3 py-2.5"><div><p className="text-sm font-medium">{t}</p><p className="text-xs text-neutral-500">{d}</p></div><a className="btn-outline !px-3 !py-1.5 text-xs" href={`/api/admin/export/${k}`}>Download</a></div>)}</div>
      </section>
      <section className="card space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold"><Upload size={17} /> Import products (CSV)</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-600">
          <li>Download the <a className="underline" href="/api/admin/export/template">template</a> (or export your products) and open it in Excel / Google Sheets.</li>
          <li>Add or change rows. Existing products are matched by <b>slug</b>, then <b>SKU</b>; anything else is created as new. New categories are created automatically.</li>
          <li>Save as <b>CSV</b> and upload it below. Put several image links in <code>images</code> separated by <code>|</code>.</li>
        </ol>
        <p className="rounded-lg bg-butter/50 p-2 text-xs">Products with options (sizes) or combo items can be updated in the product editor only — import creates and updates simple and digital products.</p>
        <label className="btn w-full cursor-pointer"><FileSpreadsheet size={16} /> {busy ? "Importing…" : "Choose CSV file"}<input type="file" accept=".csv,text/csv" className="hidden" disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} /></label>
        {res && (res.ok
          ? <div className="rounded-lg bg-green-50 p-3 text-sm text-green-900"><p className="font-medium">Done ✓ {res.created} added · {res.updated} updated{res.skipped ? ` · ${res.skipped} skipped` : ""}</p>{res.notes?.map((n: string, i: number) => <p key={i} className="mt-1 text-xs text-amber-800">{n}</p>)}</div>
          : <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{res.error}</p>)}
      </section>
    </div>
  );
}
