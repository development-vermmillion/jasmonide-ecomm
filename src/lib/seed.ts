import type { Client } from "@libsql/client";
import bcrypt from "bcryptjs";
import { slugify } from "./util";

const ph = (t: string, h: number) => `/api/ph?t=${encodeURIComponent(t)}&h=${h}`;

const CATS = [
  ["Epoxy Resin", "Clear casting, coating and art resins", 35],
  ["Jesmonite", "Acrylic casting materials, kits and sealers", 20],
  ["Silicone Moulds", "Trays, planters, jars, coasters and festive shapes", 160],
  ["Pigments", "Opaque, translucent, pearl and fluorescent colour", 290],
  ["Paints", "Metallic and fluorescent paints", 330],
  ["Woodworking", "Finishes, sanding and polishing", 28],
  ["Courses", "Learn with e-courses and guides", 210],
];

// [name, category, type, price, saleOrNull, stock, tags, spec, badge, featured]
const P: any[] = [
  ["Clear Casting Epoxy Resin", "Epoxy Resin", "variable", 0, null, 0, "resin,casting", "2:1 · Low viscosity", "Bestseller", 1,
    [["500 g", 649, null, 40], ["1 kg", 1199, 999, 25], ["3 kg", 3199, null, 12]]],
  ["Deep Pour Art Resin", "Epoxy Resin", "variable", 0, null, 0, "resin,river table", "1:1 · Deep pour up to 5 cm", "New", 0,
    [["1 kg", 1499, null, 18], ["4 kg", 5399, 4899, 6]]],
  ["UV Coating Resin (Gloss)", "Epoxy Resin", "simple", 799, null, 30, "resin,coating", "Fast cure · High gloss", "", 0],
  ["Jesmonite AC730 Starter Kit", "Jesmonite", "simple", 1899, 1599, 22, "jesmonite,kit", "Powder + liquid · Makes 6 pieces", "Sale", 1],
  ["Jesmonite AC100 Powder", "Jesmonite", "variable", 0, null, 0, "jesmonite,powder", "Eco-friendly · Water based", "", 0,
    [["1 kg", 549, null, 50], ["5 kg", 2399, null, 14], ["25 kg", 10499, null, 3]]],
  ["Acrylic Sealer Matte", "Jesmonite", "simple", 449, null, 4, "sealer,finish", "Water-based · Matte", "", 0],
  ["Round Coaster Mould", "Silicone Moulds", "simple", 349, null, 60, "mould,coaster", "10 cm · Food-grade silicone", "Bestseller", 1],
  ["Ribbed Tray Mould", "Silicone Moulds", "simple", 549, 449, 35, "mould,tray", "20 × 14 cm · Trinket tray", "Sale", 1],
  ["Planter Pot Mould Set", "Silicone Moulds", "variable", 0, null, 0, "mould,planter", "Set of 2 · Stackable", "", 0,
    [["Small", 699, null, 20], ["Medium", 899, null, 15], ["Large", 1199, 999, 9]]],
  ["Dressing Table Jar Mould", "Silicone Moulds", "simple", 599, null, 0, "mould,jar", "Lidded jar · 8 cm", "", 0],
  ["Christmas Tree Mould", "Silicone Moulds", "simple", 399, null, 28, "mould,christmas", "3D tree · 12 cm", "Festive", 0],
  ["Star & Snowflake Mould", "Silicone Moulds", "simple", 349, null, 44, "mould,christmas", "6 cavities", "Festive", 0],
  ["Mica Pigment Powder", "Pigments", "variable", 0, null, 0, "pigment,mica", "Pearl shimmer · 24 shades", "", 1,
    [["Gold · 10 g", 149, null, 80], ["Rose · 10 g", 149, null, 65], ["Pearl White · 10 g", 149, 119, 70], ["Emerald · 10 g", 149, null, 2]]],
  ["Opaque Colour Paste", "Pigments", "simple", 199, null, 90, "pigment,paste", "Concentrated · 20 ml", "", 0],
  ["Fluorescent Colour Drops", "Pigments", "simple", 249, 199, 55, "pigment,fluorescent", "Glow under UV · 15 ml", "Sale", 0],
  ["Metallic Acrylic Paint", "Paints", "variable", 0, null, 0, "paint,metallic", "Water based · Quick dry", "", 0,
    [["Gold 100 ml", 299, null, 40], ["Silver 100 ml", 299, null, 38], ["Copper 100 ml", 299, null, 31]]],
  ["Diya Painting Kit", "Paints", "simple", 499, null, 25, "paint,diya,festive", "6 diyas + paints + brush", "Festive", 0],
  ["Hardwax Wood Oil", "Woodworking", "simple", 899, null, 20, "wood,finish", "Natural finish · 500 ml", "", 0],
  ["Sanding Sponge Pack", "Woodworking", "simple", 249, null, 75, "wood,sanding", "Assorted grits · 6 pcs", "", 0],
  ["Jesmonite for Beginners (E-course)", "Courses", "digital", 1499, 999, 0, "course,jesmonite", "6 hours · Lifetime access", "Course", 1],
  ["Silicone Mould Making Masterclass", "Courses", "digital", 1999, null, 0, "course,mould", "4 hours · PDF + videos", "Course", 0],
  ["Pricing Your Handmade Decor (PDF)", "Courses", "digital", 299, null, 0, "guide,pdf", "32-page guide", "", 0],
  // combos — items: [productName, variantName|null, qty]
  ["Resin Starter Combo", "Epoxy Resin", "combo", 1499, null, 0, "combo,starter", "Resin 1 kg + coaster mould + pigment", "Combo", 1,
    null, [["Clear Casting Epoxy Resin", "1 kg", 1], ["Round Coaster Mould", null, 1], ["Opaque Colour Paste", null, 2]]],
  ["Jesmonite Decor Combo", "Jesmonite", "combo", 2599, 2399, 0, "combo,jesmonite", "AC730 kit + tray mould + sealer", "Combo", 1,
    null, [["Jesmonite AC730 Starter Kit", null, 1], ["Ribbed Tray Mould", null, 1], ["Acrylic Sealer Matte", null, 1]]],
  ["Festive Diya Combo", "Paints", "combo", 999, null, 0, "combo,festive", "Diya kit + metallic gold + sealer", "Festive", 0,
    null, [["Diya Painting Kit", null, 1], ["Metallic Acrylic Paint", "Gold 100 ml", 1]]],
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
  const vid: Record<string, number> = {};
  const lorem =
    "This is placeholder product copy. Replace it from Admin → Products with your real description, usage notes, cure times and safety information.\n\nSupports multiple paragraphs.";
  for (const row of P) {
    const [name, cat, type, price, sale, stock, tags, spec, badge, featured, variants, comboItems] = row;
    const hue = [...name].reduce((a: number, ch: string) => a + ch.charCodeAt(0), 0) % 360;
    const imgs = JSON.stringify([ph(name, hue), ph(name + " 2", (hue + 40) % 360), ph(name + " 3", (hue + 80) % 360)]);
    const minV = variants ? Math.min(...variants.map((v: any) => v[1])) : price;
    const saleDate = sale || (variants && variants.some((v: any) => v[2])) ? [daysFromNow(-3), daysFromNow(25)] : [null, null];
    const r = await c.execute({
      sql: `insert into products (type,name,slug,short_desc,spec_line,description,category_id,tags,images,price,sale_price,sale_start,sale_end,sku,stock,low_stock,track_stock,status,featured,badge,weight_g)
            values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published',?,?,?)`,
      args: [type, name, slugify(name), spec, spec, lorem, catId[cat], tags, imgs, minV, sale, saleDate[0], saleDate[1],
        "SKU-" + slugify(name).slice(0, 8).toUpperCase(), stock, 5, type === "digital" || type === "combo" ? 0 : 1, featured, badge, 500],
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
      items.push([pid[pn], pn, price, qty]);
    }
    const shipping = subtotal >= 999 ? 0 : 79;
    const status = statuses[Math.floor(R() * statuses.length)];
    const paid = status === "delivered" || status === "shipped" || R() > 0.6;
    const created = new Date(Date.now() - day * 86400000 - Math.floor(R() * 40000000)).toISOString().replace("T", " ").slice(0, 19);
    const number = "JM" + String(1001 + i);
    const o = await c.execute({
      sql: `insert into orders (number,customer_id,name,email,phone,address,city,state,pincode,subtotal,discount,shipping,tax,total,payment_method,payment_status,status,created_at)
            values (?,?,?,?,?,?,?,?,?,?,0,?,0,?,?,?,?,?)`,
      args: [number, custIds[ci], names[ci], slugify(names[ci]) + "@example.com", "9800000" + String(100 + ci), "12, Sample Street", city, state, "400001",
        subtotal, shipping, subtotal + shipping, R() > 0.5 ? "upi" : "cod", status === "cancelled" ? "failed" : paid ? "paid" : "pending", status, created],
    });
    for (const [id, n, price, qty] of items)
      await c.execute({ sql: "insert into order_items (order_id,product_id,name,price,qty) values (?,?,?,?,?)", args: [Number(o.lastInsertRowid), id, n, price, qty] });
  }

  // sample reels (replace the links in Admin → Instagram reels)
  const sim = (await c.execute("select id, name from products where type != 'combo' and status='published' order by id limit 6")).rows as any[];
  const reelTitles = ["Pouring a marble coaster", "Unmoulding day!", "Dressing-table set styling", "Resin tray glow-up", "Packing your orders", "Behind the studio"];
  for (let i = 0; i < sim.length; i++)
    await c.execute({ sql: "insert into reels (title,url,product_id,show_home,status,sort) values (?,?,?,1,'active',?)", args: [reelTitles[i], "https://www.instagram.com/reel/REPLACE_ME/", Number(sim[i].id), i] });
  // sample reviews
  const rv: [string, number, string, string][] = [
    ["Aarti S.", 5, "Beautiful finish", "Poured my first set of coasters and they came out smooth. Packaging was great."],
    ["Rohan M.", 4, "Good quality", "Does what it says. Delivery took four days."],
    ["Neha K.", 5, "Love it", "Exactly as shown. Will order again for my next project."],
    ["Imran P.", 5, "Worth the price", "Colours are rich and the instructions were clear."],
    ["Dev R.", 4, "Nice", "Solid product. Would like more colour options."],
    ["Sneha T.", 5, "Perfect gift", "Bought for my sister who loves crafting. She was thrilled."],
    ["Karan J.", 3, "Okay", "Good, but a little smaller than I imagined."],
    ["Pooja V.", 5, "Highly recommend", "Great for beginners and the support on WhatsApp was quick."],
  ];
  for (let i = 0; i < rv.length; i++)
    await c.execute({ sql: "insert into reviews (product_id,name,rating,title,body,status,verified) values (?,?,?,?,?,'approved',?)", args: [Number(sim[i % sim.length].id), rv[i][0], rv[i][1], rv[i][2], rv[i][3], i % 2] });

  await c.execute("insert into bulk_rules (name,scope,basis,min_qty,max_qty,discount_type,value) values ('Bulk saver','all','qty',5,9,'percent',5)");
  await c.execute("insert into bulk_rules (name,scope,basis,min_qty,max_qty,discount_type,value) values ('Wholesale','all','qty',10,0,'percent',10)");
  // sample FAQs + blog posts
  const faqs: [string, string][] = [
    ["How long does delivery take?", "Orders ship in 2–3 business days and usually arrive in 3–7 days across India."],
    ["Do you offer cash on delivery?", "Yes, COD is available on physical products. Digital products are paid online."],
    ["Can I return a product?", "Unused items can be returned within 7 days of delivery. Request it from your order page."],
    ["Are your materials beginner friendly?", "Yes. Our starter kits include everything you need, and our blog has step-by-step tutorials."],
    ["Do you do bulk or wholesale orders?", "Yes — message us on WhatsApp with what you need and we'll share a quote."],
  ];
  for (let i = 0; i < faqs.length; i++) await c.execute({ sql: "insert into faqs (question,answer,sort) values (?,?,?)", args: [faqs[i][0], faqs[i][1], i] });
  const posts: [string, string, string][] = [
    ["How to make a marble-effect coaster", "A beginner project: pour, swirl and set your first coaster set.", "## What you need\n\n- Jesmonite or resin\n- Silicone coaster mould\n- Two pigments\n\n## Steps\n\n1. Mix your base material.\n2. Split into two cups and tint each.\n3. Pour both into the mould and swirl once.\n4. Let it cure, then demould and seal.\n\nBrowse our [starter kits](/shop) to get everything in one box."],
    ["Jesmonite vs epoxy resin: which should you use?", "A quick guide to choosing the right material for decor and dressing-table pieces.", "## The short answer\n\n**Jesmonite** is water-based, low-odour and great for stone-like decor. **Epoxy resin** is glossy and clear, perfect for trays and jewellery.\n\n## Which one for you?\n\n- Planters, jars, trays with a matte stone look: Jesmonite\n- Glassy, translucent pieces: Epoxy resin\n\nStill unsure? Ask our assistant or message us on WhatsApp."],
    ["5 finishing tips for a professional look", "Sanding, sealing and polishing that make homemade pieces look shop-bought.", "## Finishing makes the difference\n\n1. Sand progressively from 400 to 1200 grit.\n2. Wipe clean before sealing.\n3. Use a matte or gloss sealer for the final look.\n4. Add felt feet to the base.\n5. Photograph in daylight."],
  ];
  for (const [t, ex, body] of posts)
    await c.execute({ sql: "insert into blog_posts (title,slug,excerpt,content,status,author) values (?,?,?,?,'published','Team')", args: [t, slugify(t), ex, body.replace(/\\n/g, "\n")] });

  // initial stock log
  await c.execute(`insert into stock_log (product_id, variant_id, delta, balance, reason)
    select id, null, stock, stock, 'Opening stock' from products where type='simple'`);
  await c.execute(`insert into stock_log (product_id, variant_id, delta, balance, reason)
    select product_id, id, stock, stock, 'Opening stock' from variants`);
}

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}
