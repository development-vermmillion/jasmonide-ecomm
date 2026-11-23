import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { all } from "@/lib/db";
import { getCategories, getProductById, comboPool } from "@/lib/catalog";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const [p, cats, pool, reels] = await Promise.all([getProductById(Number(params.id)), getCategories(), comboPool(), all("select id,title,url,thumb,video_url from reels where product_id = ? order by sort,id", [Number(params.id)])]);
  if (!p) notFound();
  const initial = {
    ...p, reels, images: JSON.parse(p.images || "[]"),
    items: p.items.map((i: any) => ({ product_id: i.product_id, variant_id: i.variant_id, qty: i.qty })),
    variants: p.variants.map((v: any) => ({ id: v.id, name: v.name, sku: v.sku, price: v.price, sale_price: v.sale_price, stock: v.stock })),
  };
  return <ProductForm categories={cats} pool={pool.filter((x: any) => x.id !== p.id)} initial={initial} id={p.id} />;
}
