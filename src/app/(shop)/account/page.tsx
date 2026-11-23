import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { all } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";
import { orderToken } from "@/lib/token";
import { inr, fdate } from "@/lib/util";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "My account" };
export default async function Account() {
  const s = await getSettings();
  if (s.accounts_enabled !== "1") notFound();
  const me = await getCustomer();
  if (!me) redirect("/account/login");
  const orders = await all("select number, total, status, created_at from orders where customer_id = ? order by id desc", [me.id]);
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-5">
      <div className="lg:col-span-2"><p className="eyebrow">Hello</p><h1 className="h-serif mb-4 mt-1 text-3xl">{me.name}</h1><ProfileForm me={me} />
        {s.wishlist_enabled === "1" && <Link href="/wishlist" className="btn-outline mt-4 w-full">View wishlist</Link>}</div>
      <div className="lg:col-span-3">
        <h2 className="h-serif mb-4 text-2xl">Your orders</h2>
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Link key={o.number} href={`/order/${o.number}?t=${orderToken(o.number)}`} className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5">
              <div><p className="font-medium">{o.number}</p><p className="text-xs text-neutral-500">{fdate(o.created_at)}</p></div>
              <div className="text-right"><p className="text-sm font-semibold">{inr(o.total)}</p><span className="badge bg-lilac capitalize">{o.status}</span></div>
            </Link>
          ))}
          {!orders.length && <p className="card p-8 text-center text-neutral-500">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
