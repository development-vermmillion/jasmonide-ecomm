import { all } from "@/lib/db";
import BulkManager from "@/components/admin/BulkManager";

export default async function Bulk() {
  const [rows, cats, products] = await Promise.all([all("select * from bulk_rules order by id desc"), all("select id, name from categories order by sort"), all("select id, name from products order by name")]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Bulk discounts</h1>
        <p className="text-sm text-neutral-500">Automatic discounts — no code needed. Choose all products, one category or one product, then discount by quantity (e.g. 10–20 pieces) or by order value, as a % or a fixed ₹ amount. If several rules match, the customer gets the single best one. Coupons still work on top. Turn the whole feature off in Settings → Feature switches.</p></div>
      <BulkManager rows={rows} cats={cats} products={products} />
    </div>
  );
}
