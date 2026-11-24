import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import { one } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  import("@/lib/backup").then((b) => b.maybeBackup()).catch(() => {});
  const [st, o, r, i, rv] = await Promise.all([
    getSettings(),
    one("select count(*) n from orders where status in ('pending','confirmed','processing')"),
    one("select count(*) n from returns where status = 'requested'"),
    one("select count(*) n from enquiries where status = 'new'"),
    one("select count(*) n from reviews where status = 'pending'"),
  ]);
  const counts: Record<string, number> = { "/admin/orders": o?.n || 0, "/admin/returns": r?.n || 0, "/admin/inbox": i?.n || 0, "/admin/reviews": rv?.n || 0 };
  return (
    <div className="adm min-h-screen">
      <Sidebar name={s.name} role={s.role} store={st.store_name} logo={st.logo_url} counts={counts} />
      <main className="lg:pl-[270px]">
        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-3 sm:px-6 lg:px-8">
          <Topbar open={counts["/admin/orders"]} />
          {children}
        </div>
      </main>
    </div>
  );
}
