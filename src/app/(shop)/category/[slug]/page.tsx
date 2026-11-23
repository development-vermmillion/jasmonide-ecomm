import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { one } from "@/lib/db";

export default async function Category({ params, searchParams }: { params: { slug: string }; searchParams: any }) {
  const c = await one("select * from categories where slug = ?", [params.slug]);
  if (!c) notFound();
  return <Listing title={c.name} eyebrow="Category" intro={c.description} base={`/category/${c.slug}`} params={searchParams} fixed={{ category: c.slug }} />;
}
