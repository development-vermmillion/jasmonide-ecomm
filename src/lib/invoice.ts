import { fdate } from "./util";

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const two = (n: number) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : ""));
const three = (n: number) => (n >= 100 ? ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + two(n % 100) : "") : two(n));

/** 1234.5 → "Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only" (Indian numbering). */
export function amountInWords(amount: number) {
  const rupees = Math.floor(Math.round(amount * 100) / 100);
  const paise = Math.round((amount - rupees) * 100);
  if (!rupees && !paise) return "Rupees Zero Only";
  const parts: string[] = [];
  const cr = Math.floor(rupees / 10000000), lk = Math.floor((rupees % 10000000) / 100000), th = Math.floor((rupees % 100000) / 1000), rest = rupees % 1000;
  if (cr) parts.push(three(cr) + " Crore");
  if (lk) parts.push(two(lk) + " Lakh");
  if (th) parts.push(two(th) + " Thousand");
  if (rest) parts.push(three(rest));
  return "Rupees " + (parts.join(" ") || "Zero") + (paise ? ` and ${two(paise)} Paise` : "") + " Only";
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function financialYear(dateStr: string) {
  const d = new Date(dateStr.replace(" ", "T") + "Z");
  const y = d.getUTCMonth() >= 3 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
}

export function buildInvoice(o: any, items: any[], s: Record<string, string>) {
  const subtotal = Number(o.subtotal), discount = Number(o.discount || 0), shipping = Number(o.shipping || 0), tax = Number(o.tax || 0), total = Number(o.total);
  const after = subtotal - discount;
  const inclusive = tax > 0 && Math.abs(total - (after + shipping)) < 0.02;
  const taxable = inclusive ? after - tax : after;
  const rate = taxable > 0 ? r2((tax / taxable) * 100) : 0;
  const sellerState = (s.business_state || "").trim().toLowerCase();
  const pos = (o.address ? o.state : s.business_state) || s.business_state || "";
  const intra = !o.address || !sellerState || pos.trim().toLowerCase() === sellerState;

  const lines = items.map((i) => {
    const gross = i.price * i.qty;
    const net = subtotal ? gross - (discount * gross) / subtotal : gross; // line amount after discount share
    const base = inclusive ? net / (1 + rate / 100) : net;
    const lineTax = inclusive ? net - base : (base * rate) / 100;
    return { ...i, gross: r2(gross), taxable: r2(base), tax: r2(lineTax), amount: r2(base + lineTax), unitExTax: r2(inclusive ? i.price / (1 + rate / 100) : i.price) };
  });
  const sumLines = r2(lines.reduce((a, l) => a + l.amount, 0) + shipping);
  const roundOff = r2(total - sumLines);
  const seq = String(o.id).padStart(4, "0");
  return {
    invoiceNo: `${s.invoice_prefix || "INV"}/${financialYear(o.created_at)}/${seq}`,
    invoiceDate: fdate(o.created_at),
    title: s.gstin ? "Tax Invoice" : "Invoice",
    inclusive, rate, taxable: r2(taxable), tax, intra, pos, lines, shipping, discount, subtotal, total, roundOff,
    words: amountInWords(total),
    cgst: r2(tax / 2), sgst: r2(tax - r2(tax / 2)),
  };
}
