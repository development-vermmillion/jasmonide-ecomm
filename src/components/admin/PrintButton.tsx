"use client";
import { Printer } from "lucide-react";
export default function PrintButton() {
  return <button className="btn-outline" onClick={() => window.print()}><Printer size={16} /> Print invoice</button>;
}
