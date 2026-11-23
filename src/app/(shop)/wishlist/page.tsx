import { notFound } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import WishlistView from "@/components/WishlistView";

export const metadata = { title: "Wishlist" };
export default async function Wishlist() {
  if ((await getSettings()).wishlist_enabled !== "1") notFound();
  return <WishlistView />;
}
