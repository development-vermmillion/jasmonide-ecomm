import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { getSettings } from "@/lib/catalog";

export const metadata = { title: "Sale" };
export default async function Sale({ searchParams }: { searchParams: any }) {
  if ((await getSettings()).sale_enabled !== "1") notFound();
  return <Listing title="On sale" eyebrow="Limited time" intro="Discounted products — while stocks and offers last." base="/sale" params={searchParams} fixed={{ sale: true }} />;
}
