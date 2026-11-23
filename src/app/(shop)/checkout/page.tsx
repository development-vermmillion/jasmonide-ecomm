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
        coupons: s.coupons_enabled === "1", me, loginRequired: s.guest_checkout_enabled !== "1" && !me }}
    />
  );
}
