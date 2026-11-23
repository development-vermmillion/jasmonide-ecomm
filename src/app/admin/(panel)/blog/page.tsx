import Link from "next/link";
import { Plus } from "lucide-react";
import { all } from "@/lib/db";
import { fdate } from "@/lib/util";
import { QuickSwitch, DeleteButton } from "@/components/admin/ui";

export default async function BlogAdmin() {
  const posts = await all("select id, title, slug, status, created_at from blog_posts order by id desc");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="h-serif text-3xl">Blog</h1><p className="text-sm text-neutral-500">Write tutorials and project guides — great for Google and for sharing from Instagram.</p></div><Link href="/admin/blog/new" className="btn"><Plus size={16} /> New post</Link></div>
      <div className="card divide-y divide-neutral-100">
        {posts.map((p: any) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div><Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">{p.title}</Link><p className="text-xs text-neutral-500">/blog/{p.slug} · {fdate(p.created_at)}</p></div>
            <div className="flex items-center gap-4"><QuickSwitch kind="blog" id={p.id} on={p.status === "published"} onLabel="Published" offLabel="Draft" /><Link href={`/blog/${p.slug}`} target="_blank" className="text-xs underline">View</Link><Link href={`/admin/blog/${p.id}`} className="text-xs underline">Edit</Link><DeleteButton url={`/api/admin/blog/${p.id}`} /></div>
          </div>
        ))}
        {!posts.length && <p className="p-10 text-center text-neutral-500">No posts yet.</p>}
      </div>
    </div>
  );
}
