import { all } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROLES, roleOf } from "@/lib/roles";
import SubsAdmin from "@/components/admin/SubsAdmin";

export default async function Subs() {
  const [me, rows] = await Promise.all([getSession(), all(`select s.*, p.name pname, v.name vname, c.name cname, c.email, c.phone from subscriptions s join products p on p.id = s.product_id join customers c on c.id = s.customer_id left join variants v on v.id = s.variant_id order by s.active desc, s.next_date limit 500`)]);
  const due = rows.filter((r) => r.active === 1 && r.next_date <= new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10)).length;
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Refill plans</h1><p className="text-sm text-neutral-500">Customers who chose “Subscribe & save”. Reminders go out automatically (email, plus WhatsApp if on) a few days before each refill. {due} due in the next 5 days.</p></div>
      <SubsAdmin rows={rows} canEdit={!ROLES[roleOf(me?.role)].readOnly} />
    </div>
  );
}
