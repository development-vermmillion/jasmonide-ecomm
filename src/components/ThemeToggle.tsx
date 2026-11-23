"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const n = !dark;
    setDark(n);
    document.documentElement.classList.toggle("dark", n);
    try { localStorage.setItem("theme", n ? "dark" : "light"); } catch {}
  };
  return (
    <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10 ${className}`}>
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
