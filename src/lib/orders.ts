import { all, one, run, batch } from "./db";
import { activeRules, computeBulk } from "./bulk";
import { getProductById, getSettings, unitPrice, saleActive } from "./catalog";
import { gatewayReady } from "./payments";

export async function checkCoupon(code: string, subtotal: number) {
  if ((await getSettings()).coupons_enabled !== "1") return { ok: false, discount: 0, message: "Coupons are currently disabled" };
  code = (code || "").trim().toUpperCase();
  if (!code) return { ok: false, discount: 0, message: "Enter a coupon code" };
  const c = await one("select * from coupons where upper(code) = ?", [code]);
  if (!c || !c.active) return { ok: false, discount: 0, message: "Invalid coupon" };
  if (c.expires_at && Date.now() > new Date(c.expires_at).getTime() + 86399000) return { ok: false, discount: 0, message: "Coupon expired" };
  if (c.max_uses > 0 && c.used >= c.max_uses) return { ok: false, discount: 0, message: "Coupon usage limit reached" };
  if (subtotal < (c.min_order || 0)) return { ok: false, discount: 0, message: `Minimum order ₹${c.min_order} required` };
  const discount = c.type === "percent" ? Math.round(subtotal * c.value) / 100 : Math.min(c.value, subtotal);
  return { ok: true, discount: Math.min(discount, subtotal), message: `Coupon applied: ${c.type === "percent" ? c.value + "%" : "₹" + c.value} off`, coupon: c };
}

/** Expand order lines into physical stock movements (combos → components). */
export async function expandStock(lines: { product_id: number; variant_id?: number | null; qty: number; type?: string }[]) {
  const out: { product_id: number; variant_id: number | null; qty: number }[] = [];
  for (const l of lines) {
    const p = await one("select type, track_stock from products where id = ?", [l.product_id]);
    if (!p || p.type === "digital") continue;
    if (p.type === "combo") {
      const items = await all(
        `select ci.product_id, ci.variant_id, ci.qty, p.track_stock from combo_items ci join products p on p.id = ci.product_id where ci.combo_id = ?`,
        [l.product_id]
      );
      for (const i of items) if (i.variant_id || i.track_stock) out.push({ product_id: i.product_id, variant_id: i.variant_id, qty: i.qty * l.qty });
    } else if (p.type === "variable") {
      if (l.variant_id && p.track_stock) out.push({ product_id: l.product_id, variant_id: l.variant_id, qty: l.qty });
    } else if (p.track_stock) out.push({ product_id: l.product_id, variant_id: null, qty: l.qty });
  }
  return out;
}

export async function moveStock(product_id: number, variant_id: number | null, delta: number, reason: string, ref = "") {
  if (variant_id) await run("update variants set stock = stock + ? where id = ?", [delta, variant_id]);
  else await run("update products set stock = stock + ?, updated_at = datetime('now') where id = ?", [delta, product_id]);
  const r = variant_id
    ? await one("select stock from variants where id = ?", [variant_id])
    : await one("select stock from products where id = ?", [product_id]);
  await run("insert into stock_log (product_id, variant_id, delta, balance, reason, ref) values (?,?,?,?,?,?)", [
    product_id, variant_id, delta, r?.stock ?? 0, reason, ref,
  ]);
}

export async function setStock(product_id: number, variant_id: number | null, value: number, reason: string) {
  const cur = variant_id
    ? await one("select stock from variants where id = ?", [variant_id])
    : await one("select stock from products where id = ?", [product_id]);
  return moveStock(product_id, variant_id, value - (cur?.stock ?? 0), reason);
}

type CartLine = { productId: number; variantId?: number | null; qty: number };

export async function createOrder(input: {
  items: CartLine[]; customer: any; payment_method: string; coupon?: string; customerId?: number | null;
}) {
  const s = await getSettings();
  if (s.maintenance_mode === "1") throw new Error("The store is temporarily closed. Please try again later.");
  if (!input.items?.length) throw new Error("Your cart is empty");
  if (s.guest_checkout_enabled !== "1" && !input.customerId) throw new Error("Please sign in to place an order");
  const c = input.customer || {};
  if (!c.name || !(c.phone || c.email)) throw new Error("Name and phone are required");

  const lines: any[] = [];
  for (const it of input.items) {
    const qty = Math.max(1, Math.floor(Number(it.qty) || 1));
    const p = await getProductById(Number(it.productId));
    if (!p || p.status !== "published") throw new Error("A product in your cart is no longer available");
    if (p.type === "combo" && s.combos_enabled !== "1") throw new Error(`${p.name} is not available right now`);
    let price = unitPrice(p), vname = "", sku = p.sku, vid: number | null = null, avail = p.available;
    if (p.type === "variable") {
      const v = p.variants.find((x: any) => x.id === Number(it.variantId));
      if (!v) throw new Error(`Please choose an option for ${p.name}`);
      price = unitPrice({ ...v, sale_start: p.sale_start, sale_end: p.sale_end });
      vname = v.name; sku = v.sku || p.sku; vid = v.id;
      avail = p.track_stock ? v.stock : 999999;
    }
    if (avail < qty) throw new Error(`Only ${Math.max(0, avail)} left of ${p.name}${vname ? " (" + vname + ")" : ""}`);
    lines.push({ category_id: p.category_id ?? null, product_id: p.id, variant_id: vid, name: p.name, variant_name: vname, sku, price, qty, image: p.imgs[0], type: p.type });
  }
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const physicalOrder = lines.some((l) => l.type !== "digital");
  const pm = input.payment_method || "cod";
  if (pm === "cod" && (s.cod_enabled !== "1" || !physicalOrder)) throw new Error("Cash on delivery is not available for this order");
  if (pm === "upi" && s.upi_enabled !== "1") throw new Error("UPI payment is not available right now");
  if (pm === "online" && !(await gatewayReady())) throw new Error("Online payment is not available right now");
  if (pm !== "cod" && pm !== "upi" && pm !== "online") throw new Error("Choose a payment method");
  const bulk = computeBulk(await activeRules(), lines.map((l) => ({ productId: l.product_id, categoryId: l.category_id, price: l.price, qty: l.qty })));
  let discount = bulk.discount, couponCode = "";
  if (input.coupon) {
    const r = await checkCoupon(input.coupon, subtotal - bulk.discount);
    if (!r.ok) throw new Error(r.message);
    discount += r.discount; couponCode = r.coupon.code;
  }
  const physical = lines.some((l) => l.type !== "digital");
  const after = subtotal - discount;
  const shipping = !physical || after >= Number(s.free_shipping_min) ? 0 : Number(s.shipping_flat);
  const rate = Number(s.tax_percent) || 0;
  const inclusive = s.tax_inclusive === "1";
  // inclusive: GST is already inside the prices (shown on the invoice); exclusive: GST is added on top
  const tax = inclusive ? Math.round((after - after / (1 + rate / 100)) * 100) / 100 : Math.round(after * rate) / 100;
  const total = Math.round((after + shipping + (inclusive ? 0 : tax)) * 100) / 100;

  // customer
  let cust: any = input.customerId ? { id: input.customerId } : null;
  if (!cust && c.email) cust = await one("select id from customers where email = ?", [c.email]);
  if (!cust && c.phone) cust = await one("select id from customers where phone = ?", [c.phone]);
  const customer_id = cust?.id ?? (await run("insert into customers (name,email,phone) values (?,?,?)", [c.name, c.email || "", c.phone || ""])).id;

  const tmp = "TMP" + Date.now() + Math.floor(Math.random() * 1000);
  const o = await run(
    `insert into orders (number,customer_id,name,email,phone,address,city,state,pincode,subtotal,discount,bulk_discount,bulk_label,shipping,tax,total,coupon_code,payment_method,payment_status,status,notes)
     values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'pending','pending',?)`,
    [tmp, customer_id, c.name, c.email || "", c.phone || "", c.address || "", c.city || "", c.state || "", c.pincode || "", subtotal, discount, bulk.discount, bulk.label, shipping, tax, total,
      couponCode, input.payment_method || "cod", c.notes || ""]
  );
  const number = "JM" + (1000 + o.id);
  await run("update orders set number = ? where id = ?", [number, o.id]);
  await addEvent(o.id, "Order placed", pm === "cod" ? "Cash on delivery" : pm === "upi" ? "UPI — awaiting payment" : "Online payment — awaiting payment");
  await batch(lines.map((l) => ({
    sql: "insert into order_items (order_id,product_id,variant_id,name,variant_name,sku,price,qty,image,type) values (?,?,?,?,?,?,?,?,?,?)",
    args: [o.id, l.product_id, l.variant_id, l.name, l.variant_name, l.sku, l.price, l.qty, l.image, l.type],
  })));
  for (const m of await expandStock(lines)) await moveStock(m.product_id, m.variant_id, -m.qty, "Order placed", number);
  if (couponCode) await run("update coupons set used = used + 1 where code = ?", [couponCode]);
  return { id: o.id, number, total };
}

export async function addEvent(orderId: number, label: string, note = "") {
  await run("insert into order_events (order_id,label,note) values (?,?,?)", [orderId, label, note]);
}

const CLOSED = ["cancelled", "returned"];
/** Update an order and keep stock in sync when it moves in/out of cancelled/returned. */
export async function updateOrder(id: number, patch: any) {
  const cur = await one("select * from orders where id = ?", [id]);
  if (!cur) throw new Error("Order not found");
  const fields = ["status", "payment_status", "tracking", "notes", "payment_ref"].filter((f) => patch[f] !== undefined);
  if (fields.length) await run(`update orders set ${fields.map((f) => f + " = ?").join(", ")} where id = ?`, [...fields.map((f) => patch[f]), id]);
  if (patch.status === "delivered" && !cur.delivered_at) await run("update orders set delivered_at = datetime('now') where id = ?", [id]);
  if (patch.status === "shipped" && !cur.shipped_at) await run("update orders set shipped_at = datetime('now') where id = ?", [id]);
  if (patch.status && patch.status !== cur.status) await addEvent(id, `Status: ${patch.status}`, patch.status === "shipped" && (patch.tracking ?? cur.tracking) ? `Tracking ${patch.tracking ?? cur.tracking}` : "");
  if (patch.payment_status && patch.payment_status !== cur.payment_status) {
    if (patch.payment_status === "paid" && !cur.paid_at) await run("update orders set paid_at = datetime('now') where id = ?", [id]);
    await addEvent(id, `Payment: ${patch.payment_status}`, "Updated by admin");
    if (patch.payment_status === "paid" && cur.status === "pending" && !patch.status) {
      await run("update orders set status = 'confirmed' where id = ?", [id]);
      await addEvent(id, "Status: confirmed", "Auto-confirmed on payment");
    }
  }
  if (patch.tracking && patch.tracking !== cur.tracking && !(patch.status && patch.status !== cur.status)) await addEvent(id, "Tracking added", patch.tracking);
  if (patch.status && patch.status !== cur.status) {
    const wasClosed = CLOSED.includes(cur.status), isClosed = CLOSED.includes(patch.status);
    if (wasClosed !== isClosed) {
      const items = await all("select * from order_items where order_id = ?", [id]);
      for (const m of await expandStock(items))
        await moveStock(m.product_id, m.variant_id, isClosed ? m.qty : -m.qty, isClosed ? `Order ${patch.status} – stock restored` : "Order re-opened", cur.number);
    }
  }
}
