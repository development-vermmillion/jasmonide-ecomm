import { all } from "@/lib/db";
import { toCSV } from "@/lib/util";

export async function GET(_: Request, { params }: { params: { kind: string } }) {
  let rows: any[] = [];
  switch (params.kind) {
    case "orders":
      rows = await all("select number, created_at, name, phone, email, city, state, pincode, subtotal, discount, shipping, tax, total, coupon_code, payment_method, payment_status, status, tracking from orders order by id desc");
      break;
    case "products":
      rows = (await all("select p.slug, p.name, p.type, c.name as category, p.price, p.compare_at, p.sale_price, p.sku, p.stock, p.low_stock, p.status, p.short_desc, p.spec_line, p.description, p.tags, p.images, p.featured, p.badge, p.weight_g, p.hsn, p.seo_title, p.seo_desc from products p left join categories c on c.id = p.category_id order by p.id"))
        .map((r: any) => { let im = ""; try { im = JSON.parse(r.images || "[]").join(" | "); } catch {} return { ...r, images: im }; });
      break;
    case "template":
      rows = [
        { slug: "", name: "Rose Petal Soy Candle", type: "simple", category: "Jar Candles", price: 799, compare_at: "", sale_price: "", sku: "RP-001", stock: 25, low_stock: 5, status: "published", short_desc: "Soft rose, 220 g", spec_line: "Soy wax · Cotton wick", description: "A candle that smells like a garden after rain.", tags: "candle,rose,scented", images: "https://yourdomain.com/uploads/rose.jpg", featured: 0, badge: "New", weight_g: 450, hsn: "3406", seo_title: "", seo_desc: "" },
        { slug: "", name: "Gold Mica Pigment 10 g", type: "simple", category: "Raw Materials", price: 149, compare_at: "", sale_price: "", sku: "MICA-G", stock: 80, low_stock: 10, status: "published", short_desc: "Pearl shimmer pigment", spec_line: "", description: "", tags: "pigment,mica,material", images: "", featured: 0, badge: "", weight_g: 20, hsn: "3206", seo_title: "", seo_desc: "" },
      ];
      break;
    case "inventory":
      rows = await all(`select p.name as product, '' as variant, p.sku, p.stock, p.low_stock from products p where p.type = 'simple'
        union all select p.name, v.name, v.sku, v.stock, p.low_stock from variants v join products p on p.id = v.product_id order by 1`);
      break;
    case "customers":
      rows = await all(`select c.name, c.email, c.phone, count(o.id) as orders, coalesce(sum(case when o.status not in ('cancelled','returned') then o.total end),0) as total_spent
        from customers c left join orders o on o.customer_id = c.id group by c.id order by total_spent desc`);
      break;
    case "subscribers":
      rows = await all("select email, created_at from subscribers order by id desc");
      break;
    default:
      return new Response("Unknown export", { status: 404 });
  }
  return new Response(toCSV(rows) || "no data", {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${params.kind}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
