import { getCategories } from "@/lib/catalog";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function Categories() {
  const cats = await getCategories();
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Categories</h1><p className="text-sm text-neutral-500">These power the storefront navigation and mega-menu.</p></div>
      <CategoriesManager cats={cats} />
    </div>
  );
}
