"use client";
import { useRouter } from "next/navigation";
import { call, DeleteButton } from "./ui";
import { fdate } from "@/lib/util";
import { Download, Check } from "lucide-react";

export default function InboxLists({ enquiries, subs, notify }: { enquiries: any[]; subs: any[]; notify: any[] }) {
  const router = useRouter();
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-semibold">Enquiries ({enquiries.filter((e) => e.status === "new").length} new)</h2>
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className={`card flex flex-wrap justify-between gap-3 p-4 ${e.status === "done" ? "opacity-60" : ""}`}>
              <div><p className="font-medium">{e.name} <span className="text-xs font-normal text-neutral-500">{e.email} {e.phone} · {fdate(e.created_at)}</span></p><p className="text-sm">{e.message}</p></div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-1 text-xs underline" onClick={async () => { await call(`/api/admin/inbox/enquiries/${e.id}`, "PUT", { status: e.status === "done" ? "new" : "done" }); router.refresh(); }}><Check size={13} />{e.status === "done" ? "Reopen" : "Mark done"}</button>
                <DeleteButton url={`/api/admin/inbox/enquiries/${e.id}`} />
              </div>
            </div>
          ))}
          {!enquiries.length && <p className="card p-6 text-center text-neutral-500">No enquiries.</p>}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Newsletter subscribers ({subs.length})</h2><a href="/api/admin/export?kind=subscribers" className="btn-outline !py-1.5 text-xs"><Download size={14} /> Export CSV</a></div>
        <div className="card divide-y divide-neutral-100">{subs.map((s) => <div key={s.id} className="flex items-center justify-between p-3 text-sm"><span>{s.email}</span><span className="flex items-center gap-4"><span className="text-xs text-neutral-500">{fdate(s.created_at)}</span><DeleteButton url={`/api/admin/inbox/subscribers/${s.id}`} /></span></div>)}{!subs.length && <p className="p-6 text-center text-neutral-500">No subscribers yet.</p>}</div>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Back-in-stock requests ({notify.length})</h2>
        <div className="card divide-y divide-neutral-100">{notify.map((n) => <div key={n.id} className="flex items-center justify-between p-3 text-sm"><span><b>{n.product_name}</b> · {n.email || n.phone}</span><span className="flex items-center gap-4"><span className="text-xs text-neutral-500">{fdate(n.created_at)}</span><DeleteButton url={`/api/admin/inbox/notify/${n.id}`} label="Done" /></span></div>)}{!notify.length && <p className="p-6 text-center text-neutral-500">No requests.</p>}</div>
      </section>
    </div>
  );
}
