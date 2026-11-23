import React from "react";

/** Tiny, safe markdown renderer (headings, lists, bold/italic, links, images, quotes). */
function inline(t: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(t.slice(last, m.index));
    if (m[1]) out.push(<img key={i++} src={m[3]} alt={m[2]} className="my-4 w-full rounded-xl" loading="lazy" />);
    else if (m[4]) { const ext = /^https?:/.test(m[6]); out.push(<a key={i++} href={m[6]} className="text-plum underline" {...(ext ? { target: "_blank", rel: "noopener" } : {})}>{m[5]}</a>); }
    else if (m[7]) out.push(<strong key={i++}>{m[8]}</strong>);
    else out.push(<em key={i++}>{m[10]}</em>);
    last = m.index + m[0].length;
  }
  if (last < t.length) out.push(t.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }) {
  const blocks = (text || "").replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="space-y-4 leading-relaxed text-neutral-700">
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        const h = t.match(/^(#{1,3})\s+(.*)/);
        if (h) { const L = h[1].length; const cls = L === 1 ? "text-3xl" : L === 2 ? "text-2xl" : "text-xl"; return <p key={i} role="heading" aria-level={L + 1} className={`h-serif mt-6 ${cls} text-ink`}>{inline(h[2])}</p>; }
        if (/^([-*]\s+)/.test(t)) return <ul key={i} className="list-disc space-y-1 pl-5">{t.split("\n").map((l, j) => <li key={j}>{inline(l.replace(/^[-*]\s+/, ""))}</li>)}</ul>;
        if (/^\d+\.\s+/.test(t)) return <ol key={i} className="list-decimal space-y-1 pl-5">{t.split("\n").map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s+/, ""))}</li>)}</ol>;
        if (t.startsWith(">")) return <blockquote key={i} className="border-l-4 border-plum/40 bg-lilac/40 p-3 italic">{inline(t.replace(/^>\s?/gm, ""))}</blockquote>;
        return <p key={i}>{t.split("\n").flatMap((l, j) => [j ? <br key={`b${j}`} /> : null, ...inline(l)])}</p>;
      })}
    </div>
  );
}
