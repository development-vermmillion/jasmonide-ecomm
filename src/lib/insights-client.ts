"use client";
/** First-party, privacy-friendly behaviour tracking (no cookies, no personal data) that powers Admin → Insights & Heatmap. */
type Ev = Record<string, any>;
let q: Ev[] = [], timer: any = null;
export const sid = () => { try { let s = sessionStorage.getItem("isid"); if (!s) { s = Math.random().toString(36).slice(2, 12); sessionStorage.setItem("isid", s); } return s; } catch { return "x"; } };
const off = () => { try { return new URLSearchParams(location.search).has("_hm") || (window as any).__noIns; } catch { return false; } };

export function flush() {
  if (!q.length) return;
  const body = JSON.stringify({ sid: sid(), device: innerWidth < 768 ? "mobile" : "desktop", events: q.splice(0, 40) });
  try { if (!(navigator.sendBeacon && navigator.sendBeacon("/api/insights", new Blob([body], { type: "application/json" })))) fetch("/api/insights", { method: "POST", body, keepalive: true }).catch(() => {}); } catch {}
}
export function ins(type: string, d: Ev = {}) {
  if (off()) return;
  q.push({ type, path: location.pathname, ...d });
  if (q.length >= 20 || type === "atc" || type === "wish" || type === "checkout") return flush();
  clearTimeout(timer); timer = setTimeout(flush, 4000);
}
