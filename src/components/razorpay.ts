"use client";
/** Opens Razorpay Checkout for an existing order. Resolves true when the payment was verified. */
function loadScript() {
  return new Promise<boolean>((res) => {
    if ((window as any).Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false);
    document.body.appendChild(s);
  });
}
export async function payWithRazorpay(number: string, token: string): Promise<{ ok: boolean; error?: string; dismissed?: boolean }> {
  const c = await (await fetch("/api/payments/razorpay/create", { method: "POST", body: JSON.stringify({ number, token }) })).json();
  if (!c.ok) return { ok: false, error: c.error };
  if (!(await loadScript())) return { ok: false, error: "Could not load the payment window. Check your internet connection." };
  return new Promise((resolve) => {
    const rzp = new (window as any).Razorpay({
      key: c.key, amount: c.amount, currency: "INR", name: c.name, description: c.description, order_id: c.orderId, prefill: c.prefill,
      theme: { color: "#6d5a9c" },
      modal: { ondismiss: () => resolve({ ok: false, dismissed: true }) },
      handler: async (r: any) => {
        const v = await (await fetch("/api/payments/razorpay/verify", { method: "POST", body: JSON.stringify({ number, token, ...r }) })).json();
        resolve(v.ok ? { ok: true } : { ok: false, error: v.error });
      },
    });
    rzp.on("payment.failed", (e: any) => resolve({ ok: false, error: e?.error?.description || "Payment failed. You can try again." }));
    rzp.open();
  });
}
