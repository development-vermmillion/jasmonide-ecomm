import { all } from "@/lib/db";
import CouponsManager from "@/components/admin/CouponsManager";

export default async function Coupons() {
  const rows = await all("select * from coupons order by id desc");
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Coupons</h1><p className="text-sm text-neutral-500">Discount codes customers enter at checkout.</p></div>
      <CouponsManager rows={rows} />
    </div>
  );
}
