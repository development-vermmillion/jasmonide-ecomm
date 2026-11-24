/** Pure maths for gift card + store credit + loyalty points at checkout (safe for client and server). */
const r2 = (n: number) => Math.round(n * 100) / 100;
export type WalletIn = { gift: number; credit: number; useCredit: boolean; points: number; pointsWanted: number; maxPct: number; minRedeem: number };
export function walletCalc(total: number, o: WalletIn) {
  let rem = r2(total);
  const gift = r2(Math.min(Math.max(0, o.gift), rem)); rem = r2(rem - gift);
  const credit = o.useCredit ? r2(Math.min(Math.max(0, o.credit), rem)) : 0; rem = r2(rem - credit);
  let pts = 0;
  if (o.pointsWanted > 0 && o.points >= o.minRedeem) {
    const cap = Math.floor((total * o.maxPct) / 100);
    pts = Math.max(0, Math.min(Math.floor(o.pointsWanted), Math.floor(o.points), cap, Math.floor(rem)));
  }
  rem = r2(rem - pts);
  return { gift, credit, points: pts, payable: Math.max(0, rem) };
}
