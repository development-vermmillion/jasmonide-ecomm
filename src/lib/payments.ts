import { createHmac, timingSafeEqual } from "crypto";
import { one, run } from "./db";
import { getSettings, getSecret } from "./catalog";

export async function gatewayReady() {
  const s = await getSettings();
  return s.razorpay_enabled === "1" && !!s.razorpay_key_id && !!(await getSecret("razorpay_key_secret"));
}

/** upi://pay deep link (opens any UPI app on a phone; also what the QR code contains). */
export function upiLink(s: Record<string, string>, o: { total: number; number: string }) {
  const q = new URLSearchParams({ pa: s.upi_id, pn: s.upi_payee_name || s.store_name, am: Number(o.total).toFixed(2), cu: "INR", tn: `Order ${o.number}` });
  return "upi://pay?" + q.toString().replace(/\+/g, "%20");
}
export const validUpiId = (v: string) => /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test((v || "").trim());

/** Mark an order paid (idempotent) and log it on the order timeline. */
export async function markPaid(orderId: number, info: { ref?: string; gatewayPaymentId?: string; note?: string } = {}) {
  const o = await one("select * from orders where id = ?", [orderId]);
  if (!o) throw new Error("Order not found");
  if (o.payment_status === "paid") return o;
  await run(
    "update orders set payment_status = 'paid', paid_at = datetime('now'), payment_ref = case when ? != '' then ? else payment_ref end, gateway_payment_id = case when ? != '' then ? else gateway_payment_id end, status = case when status = 'pending' then 'confirmed' else status end where id = ?",
    [info.ref || "", info.ref || "", info.gatewayPaymentId || "", info.gatewayPaymentId || "", orderId]
  );
  await run("insert into order_events (order_id,label,note) values (?,?,?)", [orderId, "Payment received", info.note || ""]);
  return one("select * from orders where id = ?", [orderId]);
}

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
export const rzpSignature = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("hex");
export const verifyRzpPayment = (orderId: string, paymentId: string, signature: string, secret: string) =>
  safeEq(rzpSignature(`${orderId}|${paymentId}`, secret), signature || "");
export const verifyRzpWebhook = (raw: string, signature: string, secret: string) => safeEq(rzpSignature(raw, secret), signature || "");

export async function rzpFetch(path: string, init: RequestInit = {}) {
  const s = await getSettings();
  const secret = await getSecret("razorpay_key_secret");
  const auth = Buffer.from(`${s.razorpay_key_id}:${secret}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1" + path, { ...init, headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.description || `Razorpay error (${r.status})`);
  return j;
}
