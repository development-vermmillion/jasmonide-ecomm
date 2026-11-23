import Listing from "@/components/Listing";

export const metadata = { title: "Shop all" };
export default function Shop({ searchParams }: { searchParams: any }) {
  return <Listing title={searchParams.q ? "Search" : "Shop all"} eyebrow="Catalogue" base="/shop" params={searchParams} />;
}
