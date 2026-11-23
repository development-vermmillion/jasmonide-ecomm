import { all } from "@/lib/db";
import ReelsManager from "@/components/admin/ReelsManager";

export default async function Reels() {
  const [rows, products] = await Promise.all([
    all("select r.*, p.name as product_name from reels r left join products p on p.id = r.product_id order by r.sort, r.id desc"),
    all("select id, name from products where type != 'combo' order by name"),
  ]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Instagram reels</h1><p className="text-sm text-neutral-500">Reels appear on the home page and on the linked product's page. Paste a public reel link — Instagram plays it inside your site.</p></div>
      <ReelsManager rows={rows} products={products} />
    </div>
  );
}
