import { notFound } from "next/navigation";
import Listing from "@/components/Listing";
import { getSettings } from "@/lib/catalog";

export const metadata = { title: "Combos & kits" };
export default async function Combos({ searchParams }: { searchParams: any }) {
  if ((await getSettings()).combos_enabled !== "1") notFound();
  return <Listing title="Combos & kits" eyebrow="Bundle & save" intro="Curated bundles that give you everything for a project at a better price." base="/combos" params={searchParams} fixed={{ type: "combo" }} />;
}
