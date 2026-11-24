import { all, one } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROLES, roleOf } from "@/lib/roles";
import GiftCardsManager from "@/components/admin/GiftCardsManager";
import { inr } from "@/lib/util";

export default async function GiftCards() {
  const [me, rows, t, cr] = await Promise.all([getSession(), all("select * from gift_cards order by id desc limit 300"), one("select coalesce(sum(balance),0) b, count(*) n from gift_cards where active = 1 and balance > 0"), one("select coalesce(sum(credit),0) c from customers")]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Gift cards & store credit</h1><p className="text-sm text-neutral-500">Issue gift cards for gifting, promotions or goodwill. Customers enter the code at checkout; store credit is applied from their account.</p></div>
      <div className="grid gap-3 sm:grid-cols-3"><div className="card p-4"><p className="text-xs text-neutral-500">Active gift cards</p><p className="text-2xl font-semibold">{t?.n || 0}</p></div><div className="card p-4"><p className="text-xs text-neutral-500">Unspent gift-card balance</p><p className="text-2xl font-semibold">{inr(t?.b || 0)}</p></div><div className="card p-4"><p className="text-xs text-neutral-500">Store credit held by customers</p><p className="text-2xl font-semibold">{inr(cr?.c || 0)}</p></div></div>
      <GiftCardsManager rows={rows} canEdit={!ROLES[roleOf(me?.role)].readOnly} />
    </div>
  );
}
