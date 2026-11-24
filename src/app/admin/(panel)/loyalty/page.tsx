import { all, one } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { getSession } from "@/lib/auth";
import FieldsForm from "@/components/admin/FieldsForm";
import { LOYALTY } from "@/lib/site-fields";
import { inr } from "@/lib/util";

export default async function Loyalty() {
  const [s, me, t, top, refs] = await Promise.all([
    getSettings(), getSession(),
    one("select coalesce(sum(points),0) p, coalesce(sum(credit),0) c, count(*) n from customers where points > 0 or credit > 0"),
    all(`select c.name, c.referral_code, count(o.id) n, (select coalesce(sum(amount),0) from wallet_log w where w.customer_id = c.id and w.kind = 'referral_reward') earned from customers c join orders o on upper(o.referral_code) = upper(c.referral_code) and o.status != 'cancelled' where c.referral_code != '' group by c.id order by n desc limit 8`),
    one("select count(*) n from orders where referral_code != '' and status not in ('cancelled','returned')"),
  ]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Loyalty, referrals & refills</h1><p className="text-sm text-neutral-500">Reward repeat customers and let happy ones bring friends. Everything here can be switched off.</p></div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="card p-4"><p className="text-xs text-neutral-500">Points customers hold</p><p className="text-2xl font-semibold">{t?.p || 0} <span className="text-sm font-normal text-neutral-500">= {inr(t?.p || 0)}</span></p></div><div className="card p-4"><p className="text-xs text-neutral-500">Store credit outstanding</p><p className="text-2xl font-semibold">{inr(t?.c || 0)}</p></div><div className="card p-4"><p className="text-xs text-neutral-500">Orders from referrals</p><p className="text-2xl font-semibold">{refs?.n || 0}</p></div></div>
      {top.length > 0 && <section className="card p-5"><h2 className="font-semibold">Top referrers</h2><ul className="mt-2 divide-y divide-neutral-100 text-sm">{top.map((r: any) => <li key={r.referral_code} className="flex justify-between py-1.5"><span>{r.name} <code className="text-xs text-neutral-500">{r.referral_code}</code></span><span>{r.n} order{r.n === 1 ? "" : "s"} · {inr(r.earned)} earned</span></li>)}</ul></section>}
      <FieldsForm groups={LOYALTY} initial={s} canEdit={me?.role === "owner"} />
    </div>
  );
}
