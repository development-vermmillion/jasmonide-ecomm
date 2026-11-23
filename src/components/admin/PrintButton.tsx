"use client";
import { Printer } from "lucide-react";
export default function PrintButton({ label = "Print" }: { label?: string }) {
  return <button className="btn" onClick={() => window.print()}><Printer size={16} /> {label}</button>;
}
