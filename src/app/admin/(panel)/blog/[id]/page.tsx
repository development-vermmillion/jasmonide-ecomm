import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import BlogEditor from "@/components/admin/BlogEditor";

export default async function EditPost({ params }: { params: { id: string } }) {
  const p = await one("select * from blog_posts where id = ?", [Number(params.id)]);
  if (!p) notFound();
  let faq = []; try { faq = JSON.parse(p.faq_json || "[]"); } catch {}
  return <div className="space-y-5"><h1 className="h-serif text-3xl">Edit post</h1><BlogEditor id={p.id} initial={{ ...p, faq }} /></div>;
}
