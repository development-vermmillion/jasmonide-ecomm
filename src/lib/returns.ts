/** Can the customer still request a return for this order? */
export function returnEligibility(order: any, s: Record<string, string>, alreadyRequested: boolean): { ok: boolean; reason: string } {
  if (s.returns_enabled !== "1") return { ok: false, reason: "Returns are not being accepted right now" };
  if (alreadyRequested) return { ok: false, reason: "A return has already been requested for this order" };
  if (order.status !== "delivered") return { ok: false, reason: "Returns can be requested once the order is delivered" };
  const days = Number(s.return_days) || 7;
  const base = order.delivered_at || order.created_at;
  const t = new Date(String(base).replace(" ", "T") + "Z").getTime();
  if (Date.now() - t > days * 86400000) return { ok: false, reason: `The ${days}-day return window has passed` };
  return { ok: true, reason: "" };
}
