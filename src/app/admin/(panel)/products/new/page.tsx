import ProductForm from "@/components/admin/ProductForm";
import { getCategories, comboPool } from "@/lib/catalog";

export default async function NewProduct({ searchParams }: { searchParams: { type?: string } }) {
  const [cats, pool] = await Promise.all([getCategories(), comboPool()]);
  const type = ["simple", "variable", "combo", "digital"].includes(searchParams.type || "") ? searchParams.type : "simple";
  return <ProductForm categories={cats} pool={pool} initial={{ type, status: "published", track_stock: type === "simple" || type === "variable" ? 1 : 0, low_stock: 5, images: [], variants: [], items: [], reels: [] }} />;
}
