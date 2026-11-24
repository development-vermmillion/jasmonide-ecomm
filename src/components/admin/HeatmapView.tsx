"use client";
import { useEffect, useRef, useState } from "react";
import { Smartphone, Monitor } from "lucide-react";

type Data = { points: [number, number, number][]; clicks: number; visitors: number; docH: number; labels: { label: string; n: number }[]; views: number; secs: number; scroll: any };
const PAL = () => {
  const c = document.createElement("canvas"); c.width = 1; c.height = 256;
  const g = c.getContext("2d")!, gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0.0, "rgba(0,0,255,0)"); gr.addColorStop(0.25, "rgba(0,120,255,0.8)"); gr.addColorStop(0.5, "rgba(0,220,120,0.9)"); gr.addColorStop(0.75, "rgba(255,230,0,0.95)"); gr.addColorStop(1.0, "rgba(255,40,0,1)");
  g.fillStyle = gr; g.fillRect(0, 0, 1, 256);
  return g.getImageData(0, 0, 1, 256).data;
};

export default function HeatmapView({ paths, initial }: { paths: { path: string; views: number; clicks: number }[]; initial: { path: string; device: string; days: number } }) {
  const [path, setPath] = useState(initial.path), [device, setDevice] = useState(initial.device), [days, setDays] = useState(initial.days);
  const [data, setData] = useState<Data | null>(null), [H, setH] = useState(2400), [fit, setFit] = useState(1), [show, setShow] = useState(true);
  const box = useRef<HTMLDivElement>(null), cv = useRef<HTMLCanvasElement>(null), fr = useRef<HTMLIFrameElement>(null);
  const W = device === "mobile" ? 390 : 1280;

  useEffect(() => { setData(null); fetch(`/api/admin/insights/heat?path=${encodeURIComponent(path)}&device=${device}&days=${days}`).then((r) => r.json()).then(setData).catch(() => {}); }, [path, device, days]);
  useEffect(() => { const f = () => box.current && setFit(Math.min(1, box.current.clientWidth / W)); f(); addEventListener("resize", f); return () => removeEventListener("resize", f); }, [W]);

  function onLoad() {
    let n = 0;
    const t = setInterval(() => {
      try {
        const d = fr.current?.contentDocument; if (!d) return;
        if (!d.getElementById("hm-css")) { const s = d.createElement("style"); s.id = "hm-css"; s.textContent = ".reveal{opacity:1!important;transform:none!important;transition:none!important}*{animation:none!important}.float-ui,[class*=CookieBanner],#assistant{display:none!important}html{scroll-behavior:auto!important}"; d.head.appendChild(s); }
        d.querySelectorAll("img[loading=lazy]").forEach((i: any) => (i.loading = "eager"));
        setH(Math.max(600, d.documentElement.scrollHeight));
      } catch {}
      if (++n > 10) clearInterval(t);
    }, 600);
  }

  useEffect(() => {
    const c = cv.current; if (!c || !data) return;
    c.width = W; c.height = H;
    const g = c.getContext("2d")!; g.clearRect(0, 0, W, H);
    if (!data.points.length) return;
    const ky = data.docH ? Math.min(1.6, Math.max(0.6, H / data.docH)) : 1;
    const max = Math.max(...data.points.map((p) => p[2])), r = device === "mobile" ? 26 : 36;
    const a = document.createElement("canvas"); a.width = W; a.height = H; const ag = a.getContext("2d")!;
    for (const [x, y, n] of data.points) {
      const cx = (x / 100) * W, cy = y * ky + 6, al = Math.min(1, 0.12 + (n / max) * 0.88);
      const gr = ag.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(0,0,0,${al})`); gr.addColorStop(1, "rgba(0,0,0,0)");
      ag.fillStyle = gr; ag.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    const img = ag.getImageData(0, 0, W, H), pal = PAL(), px = img.data;
    for (let i = 3; i < px.length; i += 4) { const al = px[i]; if (al) { const o = al * 4; px[i - 3] = pal[o]; px[i - 2] = pal[o + 1]; px[i - 1] = pal[o + 2]; px[i] = Math.min(255, pal[o + 3] * 0.85); } }
    g.putImageData(img, 0, 0);
  }, [data, H, W, device]);

  const url = path + (path.includes("?") ? "&" : "?") + "_hm=1";
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-3 text-sm">
        <select className="input !w-auto min-w-[220px] !py-1.5" value={path} onChange={(e) => setPath(e.target.value)}>
          {!paths.find((p) => p.path === path) && <option value={path}>{path}</option>}
          {paths.map((p) => <option key={p.path} value={p.path}>{p.path} — {p.views} views, {p.clicks} clicks</option>)}
        </select>
        <div className="flex rounded-full bg-[rgb(var(--c-ink)/.06)] p-0.5">{(["desktop", "mobile"] as const).map((d) => <button key={d} onClick={() => setDevice(d)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${device === d ? "bg-white font-semibold shadow-sm" : ""}`}>{d === "mobile" ? <Smartphone size={13} /> : <Monitor size={13} />}{d}</button>)}</div>
        <div className="flex gap-1">{[7, 30, 90].map((n) => <button key={n} onClick={() => setDays(n)} className={`rounded-full px-3 py-1 text-xs ${days === n ? "bg-[rgb(var(--c-ink))] text-white" : "bg-[rgb(var(--c-ink)/.06)]"}`}>{n}d</button>)}</div>
        <label className="ml-auto flex items-center gap-2 text-xs"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show heat</label>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div ref={box} className="card overflow-hidden p-0">
            <div style={{ width: W * fit, height: H * fit, position: "relative" }}>
              <div style={{ width: W, height: H, transform: `scale(${fit})`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 }}>
                <iframe ref={fr} key={url} src={url} onLoad={onLoad} title="Page preview" style={{ width: W, height: H, border: 0, background: "#fff" }} />
                <canvas ref={cv} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none", opacity: show ? 1 : 0, mixBlendMode: "multiply" }} />
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500"><span>Fewer clicks</span><span className="h-2 w-40 rounded-full" style={{ background: "linear-gradient(90deg,#0078ff,#00dc78,#ffe600,#ff2800)" }} /><span>More clicks</span></div>
        </div>
        <aside className="space-y-3">
          <div className="card grid grid-cols-2 gap-3 p-4 text-center">
            {[["Page views", data?.views], ["Clicks", data?.clicks], ["People who clicked", data?.visitors], ["Avg time", data?.secs ? data.secs + "s" : "—"]].map(([l, v]) => <div key={l as string}><p className="text-xl font-semibold">{v ?? "…"}</p><p className="text-[11px] text-neutral-500">{l}</p></div>)}
          </div>
          <div className="card p-4"><h3 className="text-sm font-semibold">How far people scroll</h3>
            {data?.scroll ? <div className="mt-2 space-y-2">{[["25% down", data.scroll.p25], ["Halfway", data.scroll.p50], ["75% down", data.scroll.p75], ["Reach the end", data.scroll.p100]].map(([l, v]) => <div key={l as string}><div className="flex justify-between text-xs"><span>{l}</span><b>{v}%</b></div><div className="mt-0.5 h-1.5 rounded-full bg-neutral-100"><div className="h-1.5 rounded-full bg-[var(--adm-accent)]" style={{ width: `${v}%` }} /></div></div>)}</div> : <p className="mt-2 text-xs text-neutral-500">Not enough data yet.</p>}
          </div>
          <div className="card p-4"><h3 className="text-sm font-semibold">Most-clicked things</h3>
            <ul className="mt-2 divide-y divide-neutral-100 text-xs">{data?.labels.map((l) => <li key={l.label} className="flex justify-between gap-2 py-1.5"><span className="truncate">{l.label || "(blank)"}</span><b>{l.n}</b></li>)}{data && !data.labels.length && <li className="py-2 text-neutral-500">No clicks recorded yet.</li>}</ul>
          </div>
        </aside>
      </div>
      <p className="text-xs text-neutral-500">Tip: red areas are where people tap the most. If a banner or image gets lots of taps but isn't a link, make it one. If an important button stays blue/empty, move it higher or make it bigger.</p>
    </div>
  );
}
