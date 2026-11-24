import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";
import { orderToken } from "@/lib/token";
import { inr, fdate } from "@/lib/util";
import ReorderButton from "@/components/ReorderButton";
import ProfileForm from "@/components/ProfileForm";
import SubsManager from "@/components/SubsManager";
import CopyText from "@/components/CopyText";
import { referralCodeFor, walletHistory } from "@/lib/wallet";

export const metadata = { title: "My account" };
export default async function Account() {
  const s = await getSettings();
  if (s.accounts_enabled !== "1") notFound();
  const me = await getCustomer();
  if (!me) redirect("/account/login");
  const orders = await all("select o.number, o.total, o.status, o.created_at, (select group_concat(name || ' ×' || qty, ', ') from order_items where order_id = o.id) as names from orders o where o.customer_id = ? order by o.id desc", [me.id]);
  const [subs, hist, me2] = await Promise.all([
    all("select s.*, p.name, v.name as vname from subscriptions s join products p on p.id = s.product_id left join variants v on v.id = s.variant_id where s.customer_id = ? and s.active >= 0 order by s.id desc", [me.id]),
    walletHistory(me.id), one("select points, credit from customers where id = ?", [me.id]),
  ]);
  const code = s.referral_enabled === "1" ? await referralCodeFor(me.id) : "";
  const base = (s.site_url || "").startsWith("http") ? s.site_url.replace(/\/$/, "") : "";
  const showWallet = s.loyalty_enabled === "1" || s.giftcards_enabled === "1" || s.referral_enabled === "1";
  const LABEL: Record<string, string> = { points_earn: "Points earned", points_spend: "Points used", points_reverse: "Points removed", credit_spend: "Store credit used", referral_reward: "Referral reward", referral_reverse: "Referral reward reversed", restore: "Balances restored", gift_spend: "Gift card used" };
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5">
      <div className="lg:col-span-2"><p className="eyebrow">Hello</p><h1 className="h-serif mb-4 mt-1 text-3xl">{me.name === "Customer" ? "friend" : me.name}</h1><ProfileForm me={me} />
        {s.wishlist_enabled === "1" && <Link href="/wishlist" className="btn-outline mt-4 w-full">View wishlist</Link>}
        {showWallet && (
          <section className="card mt-6 space-y-3 p-5">
            <h2 className="font-semibold">Rewards & wallet</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              {s.loyalty_enabled === "1" && <div className="rounded-xl bg-butter/60 p-3"><p className="text-2xl font-semibold">{me2?.points || 0}</p><p className="text-xs text-neutral-600">loyalty points (= {inr(me2?.points || 0)})</p></div>}
              <div className="rounded-xl bg-mint/60 p-3"><p className="text-2xl font-semibold">{inr(me2?.credit || 0)}</p><p className="text-xs text-neutral-600">store credit</p></div>
            </div>
            {s.loyalty_enabled === "1" && <p className="text-xs text-neutral-500">Earn {s.loyalty_earn_pct}% back in points on every delivered order. Use them at checkout.</p>}
            {code && (
              <div className="rounded-xl bg-lilac/50 p-3 text-sm">
                <p className="font-medium">Refer a friend</p>
                <p className="mt-0.5 text-xs text-neutral-600">They get {inr(Number(s.referral_friend_amount))} off their first order; you get {inr(Number(s.referral_reward))} store credit once it's delivered.</p>
                <p className="mt-2 flex flex-wrap items-center gap-2"><code className="rounded bg-white px-2 py-1 font-semibold tracking-wider">{code}</code><CopyText text={base ? `${base}/?ref=${code}` : code} label={base ? "Copy invite link" : "Copy code"} /></p>
              </div>
            )}
            {hist.length > 0 && <ul className="divide-y divide-neutral-100 text-xs text-neutral-600">{hist.slice(0, 6).map((h: any, i: number) => <li key={i} className="flex justify-between py-1.5"><span>{LABEL[h.kind] || h.kind}{h.ref ? ` · ${h.ref}` : ""}</span><span className={h.amount >= 0 ? "text-green-700" : ""}>{h.amount >= 0 ? "+" : ""}{h.amount}</span></li>)}</ul>}
          </section>
        )}
        {subs.length > 0 && <section className="mt-6"><h2 className="mb-2 font-semibold">Your refill plans</h2><SubsManager subs={subs} /></section>}</div>
      <div className="lg:col-span-3">
        <h2 className="h-serif mb-4 text-2xl">Your orders</h2>
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Link key={o.number} href={`/order/${o.number}?t=${orderToken(o.number)}`} className="card flex items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5">
              <div className="min-w-0"><p className="font-medium">{o.number}</p><p className="text-xs text-neutral-500">{fdate(o.created_at)}</p><p className="mt-0.5 truncate text-xs text-neutral-600">{o.names}</p></div>
              <div className="flex shrink-0 items-center gap-3"><div className="text-right"><p className="text-sm font-semibold">{inr(o.total)}</p><span className="badge bg-lilac capitalize">{o.status}</span></div><ReorderButton number={o.number} small /></div>
            </Link>
          ))}
          {!orders.length && <p className="card p-8 text-center text-neutral-500">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
