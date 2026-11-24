import { all, one, run } from "./db";
import { getSettings } from "./catalog";

const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (v: any) => Number(v) || 0;

export async function referralCodeFor(customerId: number) {
  const c = await one("select referral_code from customers where id = ?", [customerId]);
  if (c?.referral_code) return c.referral_code as string;
  for (let i = 0; i < 8; i++) {
    const code = "JM" + Math.random().toString(36).slice(2, 7).toUpperCase().replace(/[O0I1L]/g, "X");
    if (!(await one("select 1 from customers where referral_code = ?", [code]))) { await run("update customers set referral_code = ? where id = ?", [code, customerId]); return code; }
  }
  return "";
}

export async function lookupGift(code: string) {
  code = String(code || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return { ok: false as const, message: "Enter a gift card code" };
  const g = await one("select * from gift_cards where upper(code) = ?", [code]);
  if (!g || !g.active) return { ok: false as const, message: "Gift card not found" };
  if (g.expires_at && Date.now() > new Date(g.expires_at).getTime() + 86399000) return { ok: false as const, message: "This gift card has expired" };
  if (g.balance <= 0) return { ok: false as const, message: "This gift card has no balance left" };
  return { ok: true as const, card: g, balance: g.balance as number, message: `Gift card applied · ₹${g.balance} balance` };
}

/** Is this referral code usable for this shopper's first order? */
export async function checkReferral(code: string, who: { customerId?: number | null; email?: string; phone?: string }, goods: number) {
  const s = await getSettings();
  if (s.referral_enabled !== "1") return { ok: false, discount: 0, message: "Referrals are not active" };
  code = String(code || "").trim().toUpperCase();
  if (!code) return { ok: false, discount: 0, message: "Enter a referral code" };
  const ref = await one("select id, name from customers where upper(referral_code) = ?", [code]);
  if (!ref) return { ok: false, discount: 0, message: "Referral code not found" };
  if (who.customerId && who.customerId === ref.id) return { ok: false, discount: 0, message: "You can't use your own code" };
  const p10 = String(who.phone || "").replace(/\D/g, "").slice(-10), email = String(who.email || "").trim().toLowerCase();
  const prior = await one(
    `select 1 from orders o where o.status != 'cancelled' and (o.customer_id = ? or (? != '' and lower(o.email) = ?) or (? != '' and substr(replace(replace(replace(o.phone,' ',''),'+',''),'-',''), -10) = ?)) limit 1`,
    [who.customerId || -1, email, email, p10, p10]);
  if (prior) return { ok: false, discount: 0, message: "Referral codes are for first orders only" };
  const min = num(s.referral_min_order);
  if (goods < min) return { ok: false, discount: 0, message: `Add ₹${Math.ceil(min - goods)} more to use this code` };
  const d = Math.min(num(s.referral_friend_amount), goods);
  return { ok: true, discount: d, referrerId: ref.id as number, message: `Referral applied: ₹${d} off your first order` };
}

export async function walletLog(customerId: number | null, kind: string, amount: number, ref = "", note = "") {
  await run("insert into wallet_log (customer_id, kind, amount, ref, note) values (?,?,?,?,?)", [customerId, kind, amount, ref, note]);
}

/** Take gift card / credit / points for an order (atomic checks so nothing goes negative). */
export async function spendWallet(o: { number: string; customerId: number | null; giftCode?: string; gift: number; credit: number; points: number }) {
  if (o.gift > 0 && o.giftCode) {
    const r = await run("update gift_cards set balance = balance - ? where upper(code) = upper(?) and balance >= ?", [o.gift, o.giftCode, o.gift]);
    if (!r.changes) throw new Error("Your gift card balance changed. Please re-apply it.");
    await walletLog(o.customerId, "gift_spend", -o.gift, o.number, o.giftCode);
  }
  if (o.credit > 0 && o.customerId) {
    const r = await run("update customers set credit = credit - ? where id = ? and credit >= ?", [o.credit, o.customerId, o.credit]);
    if (!r.changes) throw new Error("Your store credit changed. Please refresh and try again.");
    await walletLog(o.customerId, "credit_spend", -o.credit, o.number);
  }
  if (o.points > 0 && o.customerId) {
    const r = await run("update customers set points = points - ? where id = ? and points >= ?", [o.points, o.customerId, o.points]);
    if (!r.changes) throw new Error("Your points balance changed. Please refresh and try again.");
    await walletLog(o.customerId, "points_spend", -o.points, o.number);
  }
}

/** Give back what an order used (cancelled / returned) and take back what it earned. Safe to call twice. */
export async function reverseWallet(order: any) {
  const n = order.number;
  if (!(await one("select 1 from wallet_log where kind = 'restore' and ref = ?", [n])) && (order.gift_used > 0 || order.credit_used > 0 || order.points_used > 0)) {
    if (order.gift_used > 0 && order.gift_code) await run("update gift_cards set balance = balance + ? where upper(code) = upper(?)", [order.gift_used, order.gift_code]);
    if (order.customer_id) await run("update customers set credit = credit + ?, points = points + ? where id = ?", [order.credit_used || 0, order.points_used || 0, order.customer_id]);
    await walletLog(order.customer_id, "restore", order.gift_used + order.credit_used + order.points_used, n, "Order cancelled/returned — balances restored");
  }
  const earned = await one("select amount from wallet_log where kind = 'points_earn' and ref = ?", [n]);
  if (earned && order.customer_id && !(await one("select 1 from wallet_log where kind = 'points_reverse' and ref = ?", [n]))) {
    await run("update customers set points = max(0, points - ?) where id = ?", [earned.amount, order.customer_id]);
    await walletLog(order.customer_id, "points_reverse", -earned.amount, n);
  }
  const rew = await one("select customer_id, amount from wallet_log where kind = 'referral_reward' and ref = ?", [n]);
  if (rew && !(await one("select 1 from wallet_log where kind = 'referral_reverse' and ref = ?", [n]))) {
    await run("update customers set credit = max(0, credit - ?) where id = ?", [rew.amount, rew.customer_id]);
    await walletLog(rew.customer_id, "referral_reverse", -rew.amount, n);
  }
}

/** On delivery: award loyalty points and the referrer's reward (once per order). */
export async function rewardDelivered(order: any) {
  const s = await getSettings();
  const n = order.number;
  if (order.customer_id && s.loyalty_enabled === "1" && !(await one("select 1 from wallet_log where kind = 'points_earn' and ref = ?", [n]))) {
    const pts = Math.floor(Math.max(0, num(order.subtotal) - num(order.discount)) * num(s.loyalty_earn_pct) / 100);
    if (pts > 0) { await run("update customers set points = points + ? where id = ?", [pts, order.customer_id]); await walletLog(order.customer_id, "points_earn", pts, n, "Order delivered"); await run("update orders set points_awarded = ? where id = ?", [pts, order.id]); }
  }
  if (order.referral_code && s.referral_enabled === "1" && !(await one("select 1 from wallet_log where kind = 'referral_reward' and ref = ?", [n]))) {
    const ref = await one("select id from customers where upper(referral_code) = upper(?)", [order.referral_code]);
    const amt = num(s.referral_reward);
    if (ref && amt > 0 && ref.id !== order.customer_id) { await run("update customers set credit = credit + ? where id = ?", [amt, ref.id]); await walletLog(ref.id, "referral_reward", amt, n, `Friend ${order.name} ordered`); }
  }
}

export async function walletHistory(customerId: number) {
  return all("select kind, amount, ref, note, created_at from wallet_log where customer_id = ? order by id desc limit 15", [customerId]);
}
