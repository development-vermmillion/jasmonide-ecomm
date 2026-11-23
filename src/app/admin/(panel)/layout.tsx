import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  const st = await getSettings();
  return (
    <div className="min-h-screen bg-lilac/30">
      <Sidebar name={s.name} role={s.role} store={st.store_name} />
      <main className="lg:pl-64"><div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div></main>
    </div>
  );
}
