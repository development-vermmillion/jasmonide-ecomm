import { all } from "@/lib/db";
import InboxLists from "@/components/admin/InboxLists";

export default async function Inbox() {
  const [enquiries, subs, notify] = await Promise.all([
    all("select * from enquiries order by id desc limit 200"),
    all("select * from subscribers order by id desc limit 500"),
    all("select n.*, p.name as product_name from notify_requests n left join products p on p.id = n.product_id order by n.id desc limit 200"),
  ]);
  return <div className="space-y-5"><div><h1 className="h-serif text-3xl">Inbox & leads</h1><p className="text-sm text-neutral-500">Contact-form enquiries, newsletter signups and stock-alert requests.</p></div><InboxLists enquiries={enquiries} subs={subs} notify={notify} /></div>;
}
