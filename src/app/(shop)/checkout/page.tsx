import { getSettings } from "@/lib/catalog";
import { gatewayReady } from "@/lib/payments";
import { getCustomer } from "@/lib/customer-auth";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Checkout" };
export default async function Checkout() {
  const [s, me, online] = await Promise.all([getSettings(), getCustomer(), gatewayReady()]);
  return (
    <CheckoutForm
      cfg={{ shipping: Number(s.shipping_flat), freeMin: Number(s.free_shipping_min), tax: Number(s.tax_percent), cod: s.cod_enabled === "1", upi: s.upi_enabled === "1", online, onlineLabel: s.razorpay_label, inclusive: s.tax_inclusive === "1",
        coupons: s.coupons_enabled === "1", me: me ? { ...me, credit: me.credit || 0, points: me.points || 0 } : null,
        wallet: { gift: s.giftcards_enabled === "1", credit: s.giftcards_enabled === "1", points: s.loyalty_enabled === "1", maxPct: Number(s.loyalty_max_redeem_pct) || 0, minRedeem: Number(s.loyalty_min_redeem) || 0, referral: s.referral_enabled === "1", referralMin: Number(s.referral_min_order) || 0 },
        pin: { cod_blocked: String(s.cod_blocked_pincodes || "") }, loginRequired: s.guest_checkout_enabled !== "1" && !me }}
    />
  );
}
