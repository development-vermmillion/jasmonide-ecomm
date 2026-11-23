"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { Markdown } from "@/lib/md";

type Msg = { role: "user" | "assistant"; content: string; chatId?: number; rated?: number };
const CHIPS = ["Help me choose a starter kit", "Shipping & delivery", "Cash on delivery?", "Return policy"];

export default function AssistantWidget({ name, greeting }: { name: string; greeting: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: greeting }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const session = useRef(Math.random().toString(36).slice(2, 12));
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open, busy]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    if (window.innerWidth < 640) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  async function send(t: string) {
    const q = t.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await (await fetch("/api/assistant", { method: "POST", body: JSON.stringify({ question: q, session: session.current }) })).json();
      setMsgs([...next, { role: "assistant", content: r.reply || "Sorry, something went wrong.", chatId: r.chatId }]);
    } catch { setMsgs([...next, { role: "assistant", content: "I can't connect right now — please try again." }]); }
    setBusy(false);
  }

  async function rate(i: number, v: 1 | -1) {
    const m = msgs[i];
    if (!m.chatId || m.rated) return;
    setMsgs((x) => x.map((y, j) => (j === i ? { ...y, rated: v } : y)));
    fetch("/api/assistant/rate", { method: "POST", body: JSON.stringify({ chatId: m.chatId, rating: v }) }).catch(() => {});
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={`Chat with ${name}`} className="float-ui fixed bottom-4 left-4 z-30 flex h-11 items-center gap-2 rounded-full bg-plum px-3.5 text-sm font-medium text-white shadow-lg transition hover:scale-105 sm:bottom-5 sm:h-auto sm:px-4 sm:py-3" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
          <Sparkles size={18} /> <span className="hidden sm:inline">Ask {name}</span>
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-paper sm:inset-auto sm:bottom-5 sm:left-5 sm:h-[560px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-neutral-200 sm:shadow-2xl" style={{ height: undefined }} role="dialog" aria-label={`${name} assistant`}>
          <div className="flex items-center justify-between rounded-t-2xl bg-lilac px-4 py-3">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-plum"><Sparkles size={16} /></span><div><p className="text-sm font-semibold">{name}</p><p className="text-[11px] text-neutral-600">Shopping assistant</p></div></div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/60"><X size={18} /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }} className={`max-w-[88%] rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-plum text-white" : "bg-lilac/60"}`}>{m.role === "user" ? m.content : <div className="[&_*]:!text-inherit [&_a]:!text-plum [&_p]:leading-snug"><Markdown text={m.content} /></div>}
                  {m.role === "assistant" && m.chatId ? <div className="mt-1.5 flex gap-2 text-neutral-500">
                    <button aria-label="Helpful" onClick={() => rate(i, 1)} className={m.rated === 1 ? "text-green-700" : "hover:text-ink"}><ThumbsUp size={13} /></button>
                    <button aria-label="Not helpful" onClick={() => rate(i, -1)} className={m.rated === -1 ? "text-red-600" : "hover:text-ink"}><ThumbsDown size={13} /></button>
                  </div> : null}</div>
              </div>
            ))}
            {busy && <div className="flex"><div className="rounded-2xl bg-lilac/60 px-3 py-2 text-neutral-500">Typing…</div></div>}
            {msgs.length === 1 && <div className="flex flex-wrap gap-2">{CHIPS.map((c) => <button key={c} onClick={() => send(c)} className="rounded-full border border-plum/30 bg-white px-3 py-1.5 text-xs hover:bg-lilac/60">{c}</button>)}</div>}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2 border-t border-neutral-200 p-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask anything…" className="input" maxLength={300} aria-label="Message" />
            <button className="btn !px-4" aria-label="Send" disabled={busy}><Send size={16} /></button>
          </form>
        </div>
      )}
    </>
  );
}
