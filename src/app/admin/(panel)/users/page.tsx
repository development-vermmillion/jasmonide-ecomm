import { all } from "@/lib/db";
import { getSession } from "@/lib/auth";
import UsersManager from "@/components/admin/UsersManager";

export default async function Users() {
  const [rows, me] = await Promise.all([all("select id, name, email, role, created_at from admins order by id"), getSession()]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Team & users</h1><p className="text-sm text-neutral-500">Give each teammate a role so they only see what they need. Owners can change everything.</p></div>
      <UsersManager rows={rows} meId={me!.id} isOwner={me!.role === "owner"} />
    </div>
  );
}
