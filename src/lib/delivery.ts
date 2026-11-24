/** Pincode serviceability + delivery estimate, driven by Admin → Integrations → Delivery & pincodes. */
export type Delivery = { ok: boolean; message: string; min?: number; max?: number; from?: string; to?: string; codOk?: boolean };

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const list = (v: string) => String(v || "").split(/[\s,;\n]+/).map((x) => x.trim()).filter(Boolean);
const matches = (pin: string, arr: string[]) => arr.some((p) => pin.startsWith(p));

export function deliveryFor(pin: string, s: Record<string, string>, base?: Date): Delivery {
  pin = String(pin || "").replace(/\D/g, "");
  if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false, message: "Enter a valid 6-digit pincode" };
  if (matches(pin, list(s.blocked_pincodes))) return { ok: false, message: "Sorry, we don't deliver to this pincode yet." };
  let min = 3, max = 7;
  const [dm, dx] = String(s.delivery_default_days || "3-7").split("-").map(Number);
  if (dm) { min = dm; max = dx || dm; }
  for (const line of String(s.delivery_zones || "").split("\n")) {
    const m = line.match(/^\s*([\d,\s]+)\s*[=:]\s*(\d+)\s*-\s*(\d+)/);
    if (m && matches(pin, list(m[1]))) { min = Number(m[2]); max = Number(m[3]); break; }
  }
  const handle = Number(s.handling_days) || 0;
  const start = base || new Date();
  const d = (n: number) => { const x = new Date(start); x.setDate(x.getDate() + n); return x; };
  return {
    ok: true, min: min + handle, max: max + handle, from: fmt(d(min + handle)), to: fmt(d(max + handle)),
    codOk: !matches(pin, list(s.cod_blocked_pincodes)),
    message: `Delivery to ${pin} by ${fmt(d(min + handle))} – ${fmt(d(max + handle))}`,
  };
}
export { addDays };
