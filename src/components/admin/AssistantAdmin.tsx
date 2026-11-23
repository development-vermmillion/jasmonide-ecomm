"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, GraduationCap, Check } from "lucide-react";
import { call, DeleteButton, QuickSwitch } from "./ui";
import { fdatetime } from "@/lib/util";

function ChatRow({ c }: { c: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(c.question);
  const [a, setA] = useState("");
  const [err, setErr] = useState("");
  async function teach() {
    const r = await call("/api/admin/assistant/teach", "POST", { question: q, answer: a, chatId: c.id });
    if (!r.ok) return setErr(r.error);
    setOpen(false); router.refresh();
  }
  return (
    <div className={`card space-y-2 p-4 ${c.handled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">“{c.question}”</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {c.rating === 1 && <ThumbsUp size={14} className="text-green-700" />}{c.rating === -1 && <ThumbsDown size={14} className="text-red-600" />}
          {!c.answered && <span className="badge bg-amber-100 text-amber-800">Couldn't answer</span>}
          <span className="badge bg-lilac">{c.source}</span>{fdatetime(c.created_at)}
        </div>
      </div>
      <p className="whitespace-pre-line rounded-lg bg-neutral-50 p-2 text-sm text-neutral-700">{c.answer}</p>
      <div className="flex items-center gap-4 text-xs">
        <button className="inline-flex items-center gap-1 underline" onClick={() => setOpen(!open)}><GraduationCap size={13} /> Teach a better answer</button>
        {!c.handled && <button className="inline-flex items-center gap-1 underline" onClick={async () => { await call(`/api/admin/assistant/chats/${c.id}`, "PUT"); router.refresh(); }}><Check size={13} /> Mark reviewed</button>}
        <DeleteButton url={`/api/admin/assistant/chats/${c.id}`} />
      </div>
      {open && (
        <div className="space-y-2 rounded-lg bg-mint/40 p-3">
          <div><label className="label">When someone asks something like…</label><input className="input" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div><label className="label">The assistant should answer</label><textarea rows={3} className="input" value={a} onChange={(e) => setA(e.target.value)} placeholder="Type the correct answer. You can use [link text](/product/slug)." /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn !py-2 text-xs" onClick={teach}>Save answer</button>
        </div>
      )}
    </div>
  );
}

function TaughtPanel({ rows }: { rows: any[] }) {
  const router = useRouter();
  const [f, setF] = useState({ question: "", answer: "" });
  const [edit, setEdit] = useState<number | null>(null);
  const [err, setErr] = useState("");
  async function save() {
    const r = edit ? await call(`/api/admin/assistant/taught/${edit}`, "PUT", { ...f, active: true }) : await call("/api/admin/assistant/teach", "POST", f);
    if (!r.ok) return setErr(r.error);
    setF({ question: "", answer: "" }); setEdit(null); setErr(""); router.refresh();
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card divide-y divide-neutral-100 lg:col-span-2">
        {rows.map((r) => (
          <div key={r.id} className={`p-4 ${r.active ? "" : "opacity-60"}`}>
            <p className="font-medium">{r.question}</p><p className="mt-1 whitespace-pre-line text-sm text-neutral-600">{r.answer}</p>
            <div className="mt-2 flex items-center gap-4 text-xs"><QuickSwitch kind="taught" id={r.id} on={!!r.active} onLabel="Used" offLabel="Off" /><span className="text-neutral-500">used {r.hits}×</span>
              <button className="underline" onClick={() => { setEdit(r.id); setF({ question: r.question, answer: r.answer }); }}>Edit</button><DeleteButton url={`/api/admin/assistant/taught/${r.id}`} /></div>
          </div>
        ))}
        {!rows.length && <p className="p-10 text-center text-neutral-500">Nothing taught yet. Teach from the Chats tab or add one here.</p>}
      </div>
      <div className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">{edit ? "Edit answer" : "Teach a new answer"}</h2>
        <div><label className="label">Question (write it the way customers ask)</label><input className="input" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} /></div>
        <div><label className="label">Answer</label><textarea rows={5} className="input" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2"><button className="btn" onClick={save}>{edit ? "Save" : "Teach"}</button>{edit && <button className="btn-outline" onClick={() => { setEdit(null); setF({ question: "", answer: "" }); }}>Cancel</button>}</div>
      </div>
    </div>
  );
}

export default function AssistantAdmin({ tab, filter, chats, taught, stats }: { tab: string; filter: string; chats: any[]; taught: any[]; stats: any }) {
  const T = (k: string, l: string) => <Link href={`/admin/assistant?tab=${k}`} className={`rounded-full px-3 py-1 text-sm ${tab === k ? "bg-plum text-white" : "bg-white"}`}>{l}</Link>;
  const F = (k: string, l: string) => <Link href={`/admin/assistant?tab=chats&filter=${k}`} className={`rounded-full px-3 py-1 text-xs ${filter === k ? "bg-plum text-white" : "bg-white"}`}>{l}</Link>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Questions asked", stats.total], ["Couldn't answer", stats.unanswered], ["Thumbs up", stats.up], ["Thumbs down", stats.down]].map(([l, n]) => <div key={l as string} className="card p-4"><p className="text-xs text-neutral-500">{l}</p><p className="h-serif text-2xl">{n}</p></div>)}
      </div>
      <div className="flex gap-2">{T("chats", "Chats")}{T("taught", `Taught answers (${taught.length})`)}</div>
      {tab === "taught" ? <TaughtPanel rows={taught} /> : (
        <>
          <div className="flex flex-wrap gap-2">{F("todo", "To review")}{F("unanswered", "Couldn't answer")}{F("down", "Thumbs down")}{F("all", "All")}</div>
          <div className="space-y-3">{chats.map((c) => <ChatRow key={c.id} c={c} />)}{!chats.length && <p className="card p-10 text-center text-neutral-500">No chats here. (Chat saving can be switched off in Brand, SEO & AI.)</p>}</div>
        </>
      )}
    </div>
  );
}
