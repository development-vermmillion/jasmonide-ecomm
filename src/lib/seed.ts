import type { Client } from "@libsql/client";
import bcrypt from "bcryptjs";
import { slugify } from "./util";

const ph = (t: string, h: number) => `/api/ph?t=${encodeURIComponent(t)}&h=${h}`;

const CATS = [
  ["Jar Candles", "Soy wax candles in glass jars — for slow evenings and quiet corners", 335],
  ["Pillar Candles", "Pillars for dinner tables, festive altars and golden-hour moments", 25],
  ["Jesmonite Candles", "Candles in handmade stone-look vessels you will keep long after the wax is gone", 165],
  ["Tealights & Floating", "Little lights for festivals, dinners and the evenings that become memories", 45],
  ["Gift Sets", "Thoughtful sets, ready to gift — so you can say it softly", 285],
  ["Raw Materials", "Jesmonite, resin, white cement and pigments — for makers who want to create their own", 205],
];

// [name, category, type, price, saleOrNull, stock, tags, spec, badge, featured, variants?, comboItems?, hsn?]
const P: any[] = [
  // Scented jar candles
  ["Vanilla Bourbon Soy Jar Candle", "Jar Candles", "variable", 0, null, 0, "candle,soy,vanilla,scented", "Soy wax · Cotton wick · 40–60 hr burn", "Bestseller", 1,
    [["Small · 150 g", 699, null, 40], ["Medium · 250 g", 1099, null, 28], ["Large · 400 g", 1599, 1399, 16]], null, "3406"],
  ["Amber & Oud Luxury Candle", "Jar Candles", "simple", 1299, 999, 24, "candle,luxury,oud,scented", "Rich woody fragrance · 250 g · Amber glass jar", "Sale", 1, null, null, "3406"],
  ["Lavender Fields Soy Candle", "Jar Candles", "simple", 849, null, 0, "candle,lavender,relax,scented", "Calming lavender & chamomile · 220 g", "", 0, null, null, "3406"],
  ["Sea Salt & Driftwood Candle", "Jar Candles", "simple", 899, null, 32, "candle,fresh,scented", "Fresh coastal fragrance · 220 g", "New", 0, null, null, "3406"],
  // Pillar candles
  ["Ivory Pillar Candle", "Pillar Candles", "variable", 0, null, 0, "candle,pillar,unscented,wedding", "Smooth · Dripless · Unscented", "", 0,
    [["3 × 3 in", 349, null, 60], ["3 × 6 in", 549, null, 45], ["4 × 6 in", 799, 699, 22]], null, "3406"],
  ["Marble Swirl Pillar Candle", "Pillar Candles", "simple", 649, null, 35, "candle,pillar,marble,decor", "Hand-swirled marble effect · 3 × 5 in", "Bestseller", 1, null, null, "3406"],
  ["Rustic Ribbed Pillar Candle", "Pillar Candles", "simple", 599, null, 4, "candle,pillar,ribbed", "Textured ribbed finish · 3 × 4 in", "", 0, null, null, "3406"],
  // Jesmonite vessel candles
  ["Terrazzo Jesmonite Vessel Candle", "Jesmonite Candles", "simple", 1499, null, 18, "candle,jesmonite,terrazzo,designer", "Handmade jesmonite vessel · Soy wax · 200 g", "New", 1, null, null, "3406"],
  ["Concrete Cylinder Candle", "Jesmonite Candles", "simple", 1199, null, 14, "candle,concrete,cement,minimal", "White cement vessel · Matte finish · 180 g", "", 0, null, null, "3406"],
  ["Sandstone Bowl Candle", "Jesmonite Candles", "variable", 0, null, 0, "candle,jesmonite,bowl,designer", "Hand-finished sandstone look · Refillable", "", 1,
    [["Single wick", 1399, null, 12], ["Triple wick", 1999, 1799, 8]], null, "3406"],
  // Tealights & floating
  ["Floating Rose Candles (Set of 6)", "Tealights & Floating", "simple", 449, null, 50, "candle,floating,rose,decor", "Unscented · 4–5 hr burn each", "", 0, null, null, "3406"],
  ["Scented Tealights (Pack of 12)", "Tealights & Floating", "simple", 349, null, 90, "candle,tealight,scented", "Choose-your-scent look · 4 hr burn", "Bestseller", 0, null, null, "3406"],
  ["Festive Diya Candles (Set of 8)", "Tealights & Floating", "simple", 399, 329, 44, "candle,diya,festive,diwali", "Wax diyas in gold & ivory", "Festive", 0, null, null, "3406"],
  // Gift sets / combos — items: [productName, variantName|null, qty]
  ["Relax & Unwind Gift Set", "Gift Sets", "combo", 1899, null, 0, "combo,gift,relax", "Lavender candle + tealights + floating roses", "Combo", 1,
    null, [["Lavender Fields Soy Candle", null, 1], ["Scented Tealights (Pack of 12)", null, 1], ["Floating Rose Candles (Set of 6)", null, 1]], "3406"],
  ["Luxury Trio Hamper", "Gift Sets", "combo", 3099, 2799, 0, "combo,gift,luxury", "Amber & Oud + Vanilla (Medium) + Terrazzo vessel", "Gift", 1,
    null, [["Amber & Oud Luxury Candle", null, 1], ["Vanilla Bourbon Soy Jar Candle", "Medium · 250 g", 1], ["Terrazzo Jesmonite Vessel Candle", null, 1]], "3406"],
  // Raw materials
  ["Jesmonite AC730 Kit (Powder + Liquid)", "Raw Materials", "variable", 0, null, 0, "jesmonite,material,casting", "Water-based · Low odour · Easy to cast", "Bestseller", 1,
    [["1.5 kg kit", 1899, 1599, 22], ["6 kg kit", 6499, null, 9]], null, "3824"],
  ["Clear Casting Epoxy Resin", "Raw Materials", "variable", 0, null, 0, "resin,epoxy,material", "2:1 · Crystal clear · Low viscosity", "", 0,
    [["500 g", 649, null, 40], ["1 kg", 1199, 999, 25], ["3 kg", 3199, null, 12]], null, "3907"],
  ["White Cement (Premium Grade)", "Raw Materials", "variable", 0, null, 0, "white cement,material,casting", "Fine white · Ideal for candle vessels & decor", "", 0,
    [["1 kg", 129, null, 120], ["5 kg", 549, null, 50], ["25 kg", 2399, null, 10]], null, "2523"],
  ["Mica Pigment Powder", "Raw Materials", "variable", 0, null, 0, "pigment,mica,material", "Pearl shimmer · Safe for wax, resin & jesmonite", "", 0,
    [["Gold · 10 g", 149, null, 80], ["Rose · 10 g", 149, null, 65], ["Pearl White · 10 g", 149, 119, 70], ["Emerald · 10 g", 149, null, 2]], null, "3206"],
];

export async function seed(c: Client) {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const pass = process.env.ADMIN_PASSWORD || "admin123";
  await c.execute({
    sql: "insert into admins (name,email,password_hash,role) values (?,?,?,'owner')",
    args: ["Store Owner", email, bcrypt.hashSync(pass, 10)],
  });

  const catId: Record<string, number> = {};
  for (const [name, desc, hue] of CATS) {
    const r = await c.execute({
      sql: "insert into categories (name,slug,description,image,sort) values (?,?,?,?,?)",
      args: [name as string, slugify(name as string), desc as string, ph(name as string, hue as number), Object.keys(catId).length],
    });
    catId[name as string] = Number(r.lastInsertRowid);
  }

  const pid: Record<string, number> = {};
  const img0: Record<string, string> = {};
  const skuOf: Record<string, string> = {};
  const vid: Record<string, number> = {};
  const story: Record<string, (n: string, spec: string) => string> = {
    "Jar Candles": (n, spec) => `${n} is made for the evenings you finally get to slow down. Poured by hand in a small batch with clean-burning soy wax and a cotton wick, it fills your space with a scent that feels like a hug from someone you love.\n\n${spec}\n\n**Lovely for:** your reading corner, a long bath, or a gift that says "I was thinking of you".\n\n**Care:** trim the wick to 5 mm, let the first burn melt to the edges, and never leave a flame unattended.`,
    "Pillar Candles": (n, spec) => `${n} is for the tables where stories get told. Hand-poured and finished with care, it turns dinners, festivals and quiet rituals into moments worth remembering.\n\n${spec}\n\n**Lovely for:** festive tables, altars, and golden-hour corners.\n\n**Care:** trim the wick before each burn and keep on a heat-safe holder.`,
    "Jesmonite Candles": (n, spec) => `${n} begins as a hand-poured vessel and ends as something you keep. Shaped by hand and finished with a stone-like texture, no two pieces are exactly alike — and that is the beauty of it.\n\n${spec}\n\n**Lovely for:** shelves, desks and gifts for people with good taste. When the candle is done, let it live on as a planter or trinket holder.\n\n**Care:** wipe with a dry cloth; keep away from water.`,
    "Tealights & Floating": (n, spec) => `${n} brings a little glow to the occasions you want to hold on to — festivals, dinners, a quiet night in.\n\n${spec}\n\n**Lovely for:** festive décor, bowls of water and petals, and tables full of people you love.\n\n**Care:** use on a heat-safe surface and never leave unattended.`,
    "Gift Sets": (n, spec) => `${n} is the gift that says what words sometimes can't. Chosen to go together and packed by hand, it arrives ready to make someone's day a little softer.\n\n${spec}\n\n**Lovely for:** birthdays, housewarmings, festivals, and "just because".`,
    "Raw Materials": (n, spec) => `${n} is for makers — the ones who want to pour, shape and create something that is truly their own. We use these materials in our own studio, and we are happy to share what we have learned.\n\n${spec}\n\n**New to this?** Message us on WhatsApp and we will help you choose what to start with.\n\n**Safety:** follow the instructions on the pack and work in a ventilated space.`,
  };
  for (const row of P) {
    const [name, cat, type, price, sale, stock, tags, spec, badge, featured, variants, comboItems, hsn] = row;
    const hue = [...name].reduce((a: number, ch: string) => a + ch.charCodeAt(0), 0) % 360;
    img0[name] = ph(name, hue);
    skuOf[name] = "SKU-" + slugify(name).slice(0, 8).toUpperCase();
    const imgs = JSON.stringify([ph(name, hue), ph(name + " 2", (hue + 40) % 360), ph(name + " 3", (hue + 80) % 360)]);
    const minV = variants ? Math.min(...variants.map((v: any) => v[1])) : price;
    const saleDate = sale || (variants && variants.some((v: any) => v[2])) ? [daysFromNow(-3), daysFromNow(25)] : [null, null];
    const r = await c.execute({
      sql: `insert into products (type,name,slug,short_desc,spec_line,description,category_id,tags,images,price,sale_price,sale_start,sale_end,sku,stock,low_stock,track_stock,status,featured,badge,weight_g,hsn)
            values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published',?,?,?,?)`,
      args: [type, name, slugify(name), spec, spec, story[cat](name, spec), catId[cat], tags, imgs, minV, sale, saleDate[0], saleDate[1],
        "SKU-" + slugify(name).slice(0, 8).toUpperCase(), stock, 5, type === "digital" || type === "combo" ? 0 : 1, featured, badge, 500, hsn || ""],
    });
    pid[name] = Number(r.lastInsertRowid);
    if (variants) {
      for (const [vn, vp, vs, vstock] of variants) {
        const vr = await c.execute({
          sql: "insert into variants (product_id,name,sku,price,sale_price,stock) values (?,?,?,?,?,?)",
          args: [pid[name], vn, "V-" + slugify(vn).toUpperCase().slice(0, 8), vp, vs, vstock],
        });
        vid[name + "|" + vn] = Number(vr.lastInsertRowid);
      }
    }
    if (comboItems) {
      let value = 0;
      for (const [pn, vn, q] of comboItems) {
        await c.execute({
          sql: "insert into combo_items (combo_id,product_id,variant_id,qty) values (?,?,?,?)",
          args: [pid[name], pid[pn], vn ? vid[pn + "|" + vn] : null, q],
        });
        const src = P.find((x) => x[0] === pn);
        const unit = vn ? src[10].find((v: any) => v[0] === vn)[1] : src[3];
        value += unit * q;
      }
      await c.execute({ sql: "update products set compare_at=? where id=?", args: [value, pid[name]] });
    }
  }

  // coupons
  await c.execute({ sql: "insert into coupons (code,type,value,min_order,max_uses,expires_at) values ('WELCOME10','percent',10,500,0,?)", args: [daysFromNow(90)] });
  await c.execute({ sql: "insert into coupons (code,type,value,min_order,max_uses,expires_at) values ('FLAT100','fixed',100,1000,100,?)", args: [daysFromNow(60)] });

  // sample customers & orders over the last 45 days (for dashboard demo)
  const names = ["Aarav Mehta", "Diya Sharma", "Kabir Singh", "Ishita Rao", "Rohan Gupta", "Meera Nair", "Vikram Joshi", "Ananya Iyer", "Sahil Khan", "Priya Patel", "Neha Verma", "Arjun Reddy"];
  const cities = [["Mumbai", "Maharashtra"], ["Delhi", "Delhi"], ["Bengaluru", "Karnataka"], ["Pune", "Maharashtra"], ["Jaipur", "Rajasthan"], ["Chennai", "Tamil Nadu"]];
  const simple = Object.keys(pid).filter((n) => P.find((x) => x[0] === n)[2] === "simple");
  const statuses = ["delivered", "delivered", "delivered", "shipped", "processing", "confirmed", "pending", "cancelled"];
  let rnd = 7;
  const R = () => ((rnd = (rnd * 9301 + 49297) % 233280) / 233280);
  const custIds: number[] = [];
  for (const n of names) {
    const r = await c.execute({ sql: "insert into customers (name,email,phone) values (?,?,?)", args: [n, slugify(n) + "@example.com", "98" + Math.floor(10000000 + R() * 89999999)] });
    custIds.push(Number(r.lastInsertRowid));
  }
  for (let i = 0; i < 46; i++) {
    const day = Math.floor(R() * 45);
    const ci = Math.floor(R() * names.length);
    const [city, state] = cities[Math.floor(R() * cities.length)];
    const nItems = 1 + Math.floor(R() * 3);
    let subtotal = 0;
    const items: any[] = [];
    for (let k = 0; k < nItems; k++) {
      const pn = simple[Math.floor(R() * simple.length)];
      const src = P.find((x) => x[0] === pn);
      const price = src[4] || src[3];
      const qty = 1 + Math.floor(R() * 2);
      subtotal += price * qty;
      items.push([pid[pn], pn, price, qty, img0[pn], skuOf[pn]]);
    }
    const shipping = subtotal >= 999 ? 0 : 79;
    const status = statuses[Math.floor(R() * statuses.length)];
    const method = R() > 0.5 ? "upi" : "cod";
    const paid = status === "delivered" || status === "shipped" || R() > 0.6;
    const created = new Date(Date.now() - day * 86400000 - Math.floor(R() * 40000000)).toISOString().replace("T", " ").slice(0, 19);
    const number = "JM" + String(1001 + i);
    const pstatus = status === "cancelled" ? "failed" : paid ? "paid" : "pending";
    const tax = Math.round((subtotal - subtotal / 1.18) * 100) / 100; // prices include 18% GST
    const stamp = (h: number) => new Date(new Date(created.replace(" ", "T") + "Z").getTime() + h * 3600000).toISOString().replace("T", " ").slice(0, 19);
    const paidAt = pstatus === "paid" ? stamp(method === "upi" ? 0.2 : 72) : null;
    const shippedAt = ["shipped", "delivered"].includes(status) ? stamp(30) : null;
    const deliveredAt = status === "delivered" ? stamp(96) : null;
    const o = await c.execute({
      sql: `insert into orders (number,customer_id,name,email,phone,address,city,state,pincode,subtotal,discount,shipping,tax,total,payment_method,payment_status,status,created_at,payment_ref,paid_at,shipped_at,delivered_at,tracking)
            values (?,?,?,?,?,?,?,?,?,?,0,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [number, custIds[ci], names[ci], slugify(names[ci]) + "@example.com", "9800000" + String(100 + ci), "12, Sample Street, Near Central Park", city, state, "400001",
        subtotal, shipping, tax, subtotal + shipping, method, pstatus, status, created,
        method === "upi" && pstatus === "paid" ? "UTR" + (412000000000 + Math.floor(R() * 99999999)) : "", paidAt, shippedAt, deliveredAt, shippedAt ? "DTDC" + (7000000 + Math.floor(R() * 999999)) : ""],
    });
    const oid = Number(o.lastInsertRowid);
    for (const [id, n, price, qty, image, sku] of items)
      await c.execute({ sql: "insert into order_items (order_id,product_id,name,sku,price,qty,image,type) values (?,?,?,?,?,?,?,'simple')", args: [oid, id, n, sku, price, qty, image] });
    const ev = async (label: string, at: string, note = "") =>
      c.execute({ sql: "insert into order_events (order_id,label,note,created_at) values (?,?,?,?)", args: [oid, label, note, at] });
    await ev("Order placed", created, method === "cod" ? "Cash on delivery" : "UPI payment");
    if (paidAt) await ev("Payment received", paidAt);
    if (status !== "pending" && status !== "cancelled") await ev("Order confirmed", stamp(2));
    if (shippedAt) await ev("Shipped", shippedAt);
    if (deliveredAt) await ev("Delivered", deliveredAt);
    if (status === "cancelled") await ev("Order cancelled", stamp(5));
  }

  // sample reels (replace the links in Admin → Instagram reels)
  const sim = (await c.execute("select id, name from products where type != 'combo' and status='published' order by id limit 6")).rows as any[];
  const reelTitles = ["Pouring a vanilla soy candle", "Unmoulding a jesmonite vessel", "Styling a candle corner", "Amber & Oud first burn", "Packing your gift set", "Behind the studio"];
  for (let i = 0; i < sim.length; i++)
    await c.execute({ sql: "insert into reels (title,url,product_id,show_home,status,sort) values (?,?,?,1,'active',?)", args: [reelTitles[i], "https://www.instagram.com/reel/REPLACE_ME/", Number(sim[i].id), i] });
  // sample reviews
  const rv: [string, number, string, string][] = [
    ["Aarti S.", 5, "Beautiful fragrance", "The scent fills the room without being overpowering. Packaging was lovely."],
    ["Rohan M.", 4, "Good quality", "Burns evenly. Delivery took four days."],
    ["Neha K.", 5, "Love it", "Exactly as shown. Will order again as a gift."],
    ["Imran P.", 5, "Worth the price", "Finish is premium and it arrived perfectly packed."],
    ["Dev R.", 4, "Nice", "Solid product. Would like a few more scents."],
    ["Sneha T.", 5, "Perfect gift", "Bought for my sister’s housewarming. She was thrilled."],
    ["Karan J.", 3, "Okay", "Good, but a little smaller than I imagined."],
    ["Pooja V.", 5, "Highly recommend", "Great service and the support on WhatsApp was quick."],
  ];
  for (let i = 0; i < rv.length; i++)
    await c.execute({ sql: "insert into reviews (product_id,name,rating,title,body,status,verified) values (?,?,?,?,?,'approved',?)", args: [Number(sim[i % sim.length].id), rv[i][0], rv[i][1], rv[i][2], rv[i][3], i % 2] });

  await c.execute("insert into bulk_rules (name,scope,basis,min_qty,max_qty,discount_type,value) values ('Bulk saver','all','qty',5,9,'percent',5)");
  await c.execute("insert into bulk_rules (name,scope,basis,min_qty,max_qty,discount_type,value) values ('Wholesale','all','qty',10,0,'percent',10)");
  // sample FAQs + blog posts
  const faqs: [string, string][] = [
    ["Is Jasmonoide a new brand?", "Yes — we are a brand-new studio, and every order truly means the world to us. Each one is packed by hand and checked by us personally."],
    ["How long does delivery take?", "We pack your order in 2–3 business days, and it usually reaches you in 3–7 days across India. We'll keep you posted along the way."],
    ["Do you offer cash on delivery?", "Yes, COD is available on physical products. You can also pay by UPI, whichever feels easiest."],
    ["Can I return a product?", "If something isn't right, tell us within 7 days of delivery and we'll make it right. For safety, candles that have been lit cannot be returned."],
    ["What are your candles made of?", "Our jar candles are hand-poured in small batches with clean-burning soy wax and cotton wicks. Burn time depends on size — see each product page."],
    ["I'm new to candle or jesmonite making — can you help?", "Of course. Our Raw Materials range is chosen for makers, and we're happy to guide you on WhatsApp. Everyone starts somewhere."],
    ["Can I send a candle as a gift with a message?", "Absolutely. Add a note in the order comments and we'll tuck a handwritten card into the parcel. For bulk or corporate gifting, message us on WhatsApp."],
  ];
  for (let i = 0; i < faqs.length; i++) await c.execute({ sql: "insert into faqs (question,answer,sort) values (?,?,?)", args: [faqs[i][0], faqs[i][1], i] });
  const posts: [string, string, string][] = [
    ["Hello from our little studio", "Why we started, and why you're part of our first chapter.", "## Every brand starts with a small flame\n\nJasmonoide began with a simple wish: to make things that help people slow down. A candle is a small thing — but a lit candle at the end of a long day can feel like the world finally exhaling.\n\n## Made by hand, in small batches\n\nWe pour in small batches because we'd rather make fewer things with more care. Every candle is checked, every parcel is packed by hand.\n\n## You're part of chapter one\n\nWe are just getting started, and you being here means more than we can say. Tell us what you'd love to see next — we read every message.\n\nWith love,\nThe Jasmonoide studio\n\nBrowse the [new arrivals](/shop) or say hello on WhatsApp."],
    ["How to care for your candle for a longer, cleaner burn", "Trim, burn and store your candle the right way.", "## Before the first burn\n\nLet the first burn run until the wax melts all the way to the edge. This stops tunnelling.\n\n## Every time\n\n1. Trim the wick to about 5 mm.\n2. Burn for 2–3 hours at a time.\n3. Keep away from drafts and flammable items.\n4. Never leave a burning candle unattended.\n\nBrowse our [jar candles](/shop) to find your scent."],
    ["Jesmonite vs resin vs white cement for candle vessels", "A quick guide to the three materials we stock.", "## The short answer\n\n**Jesmonite** is water-based, low-odour and gives a stone-like finish. **Epoxy resin** is glossy and translucent. **White cement** is the budget-friendly choice for minimal concrete-look vessels.\n\n## Which one for you?\n\n- Premium matte vessels: Jesmonite\n- Glassy, colourful pieces: Epoxy resin\n- Minimal, sturdy vessels: White cement\n\nAsk our assistant or message us on WhatsApp if you are unsure."],
    ["5 ways to style candles at home", "Simple ideas for tables, shelves and festive corners.", "## Styling ideas\n\n1. Group candles in odd numbers.\n2. Mix heights with pillars and jars.\n3. Use a tray to anchor the display.\n4. Match scent strength to the room size.\n5. Add floating candles for dinners."],
  ];
  for (const [t, ex, body] of posts)
    await c.execute({ sql: "insert into blog_posts (title,slug,excerpt,content,status,author) values (?,?,?,?,'published','Team')", args: [t, slugify(t), ex, body] });

  // initial stock log
  await c.execute(`insert into stock_log (product_id, variant_id, delta, balance, reason)
    select id, null, stock, stock, 'Opening stock' from products where type='simple'`);
  await c.execute(`insert into stock_log (product_id, variant_id, delta, balance, reason)
    select product_id, id, stock, stock, 'Opening stock' from variants`);
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}
