import { notFound } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import GiftBalance from "@/components/GiftBalance";
export const metadata = { title: "Gift card balance" };
export default async function GiftCardPage() {
  const s = await getSettings();
  if (s.giftcard_balance_page !== "1" || s.giftcards_enabled !== "1") notFound();
  return <div className="mx-auto max-w-md px-4 py-14"><p className="eyebrow">Gift cards</p><h1 className="h-serif mt-1 text-3xl">Check your balance</h1><p className="mt-2 text-sm text-neutral-600">Enter the code on your gift card. You can spend it at checkout on {s.store_name}.</p><GiftBalance /></div>;
}
