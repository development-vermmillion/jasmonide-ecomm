"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/** Registers the service worker and offers "Add to home screen" once, politely. */
export default function PwaRegister() {
  const [ev, setEv] = useState<any>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const h = (e: any) => { e.preventDefault(); try { if (localStorage.getItem("pwa_no")) return; } catch {} setTimeout(() => setEv(e), 25000); };
    addEventListener("beforeinstallprompt", h);
    return () => removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!ev) return null;
  const close = () => { try { localStorage.setItem("pwa_no", "1"); } catch {} setEv(null); };
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl dark:bg-neutral-900">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum text-white"><Download size={18} /></span>
      <p className="flex-1 text-sm">Add us to your home screen for faster shopping.</p>
      <button className="btn !px-3 !py-1.5 text-xs" onClick={async () => { ev.prompt(); await ev.userChoice.catch(() => {}); close(); }}>Add</button>
      <button aria-label="Close" onClick={close}><X size={16} /></button>
    </div>
  );
}
