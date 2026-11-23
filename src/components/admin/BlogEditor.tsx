"use client";
import { Save, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, Switch } from "./ui";
import ImageField from "./ImageField";
import { Markdown } from "@/lib/md";

export default function BlogEditor({ initial, id }: { initial: any; id?: number }) {
  const router = useRouter();
  const [f, setF] = useState<any>(initial);
  const [err, setErr] = useState(""); const [ok, setOk] = useState(false); const [prev, setPrev] = useState(false);
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const inp = (k: string) => ({ className: "input", value: f[k] ?? "", onChange: (e: any) => set(k, e.target.value) });
  async function save() {
    setErr("");
    const r = id ? await call(`/api/admin/blog/${id}`, "PUT", f) : await call("/api/admin/blog", "POST", f);
    if (!r.ok) return setErr(r.error);
    if (id) { setOk(true); setTimeout(() => setOk(false), 2000); router.refresh(); } else router.push(`/admin/blog/${r.id}`);
  }
  return (
    <div className="space-y-5 pb-20">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card space-y-3 p-5">
            <div><label className="label">Title *</label><input {...inp("title")} /></div>
            <div><label className="label">Short summary (shown on the blog list & Google)</label><textarea rows={2} {...inp("excerpt")} /></div>
            <div>
              <div className="flex items-center justify-between"><label className="label">Article</label><button type="button" className="text-xs underline" onClick={() => setPrev(!prev)}>{prev ? "Edit" : "Preview"}</button></div>
              {prev ? <div className="rounded-lg border border-neutral-200 p-4"><Markdown text={f.content} /></div> : <textarea rows={18} {...inp("content")} placeholder={"## Heading\n\nWrite normally. **bold**, *italic*, [link](/shop), ![image](/uploads/x.jpg)\n\n- bullet\n- bullet"} />}
              <p className="mt-1 text-xs text-neutral-500">Tip: use ## for headings, - for bullets, [text](link) for links (link to your products!), ![alt](image-url) for pictures (upload via the cover box to get a URL).</p>
            </div>
          </section>
          <section className="card p-5">
            <h2 className="font-semibold">FAQ for this article <span className="text-xs font-normal text-neutral-500">(great for Google & AI answers)</span></h2>
            <div className="mt-3 space-y-3">
              {(f.faq || []).map((q: any, i: number) => (
                <div key={i} className="grid gap-2 rounded-lg bg-lilac/40 p-3">
                  <input className="input" placeholder="Question" value={q.q} onChange={(e) => set("faq", f.faq.map((x: any, j: number) => j === i ? { ...x, q: e.target.value } : x))} />
                  <textarea rows={2} className="input" placeholder="Answer" value={q.a} onChange={(e) => set("faq", f.faq.map((x: any, j: number) => j === i ? { ...x, a: e.target.value } : x))} />
                  <button type="button" className="justify-self-start text-xs text-red-600 underline" onClick={() => set("faq", f.faq.filter((_: any, j: number) => j !== i))}><Trash2 size={12} className="mr-1 inline" />Remove</button>
                </div>
              ))}
              <button type="button" className="btn-outline" onClick={() => set("faq", [...(f.faq || []), { q: "", a: "" }])}><Plus size={14} /> Add question</button>
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <section className="card space-y-3 p-5">
            <div className="flex items-center justify-between rounded-lg bg-mint/50 p-3 text-sm"><span>{f.status === "published" ? "Published" : "Draft"}</span><Switch on={f.status === "published"} onChange={(v) => set("status", v ? "published" : "draft")} /></div>
            <div><label className="label">Cover image</label><ImageField value={f.cover} onChange={(v) => set("cover", v)} /></div>
            <div><label className="label">Tags (comma separated)</label><input {...inp("tags")} /></div>
            <div><label className="label">Author</label><input {...inp("author")} /></div>
          </section>
          <section className="card space-y-3 p-5">
            <h2 className="font-semibold">SEO</h2>
            <div><label className="label">URL slug</label><input {...inp("slug")} placeholder="auto from title" /></div>
            <div><label className="label">SEO title</label><input {...inp("seo_title")} /></div>
            <div><label className="label">Meta description</label><textarea rows={3} {...inp("seo_desc")} /></div>
          </section>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-neutral-200 bg-paper/95 px-4 py-3 backdrop-blur lg:left-64">
        <button className="btn" onClick={save}><Save size={16} /> {id ? "Save post" : "Create post"}</button>{ok && <span className="text-sm text-green-700">Saved ✓</span>}{err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </div>
  );
}
