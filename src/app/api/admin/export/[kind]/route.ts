import { all } from "@/lib/db";
import { toCSV } from "@/lib/util";

export async function GET(_: Request, { params }: { params: { kind: string } }) {
  let rows: any[] = [];
  switch (params.kind) {
    case "orders":
      rows = await all("select number, created_at, name, phone, email, city, state, pincode, subtotal, discount, shipping, tax, total, coupon_code, payment_method, payment_status, status, tracking from orders order by id desc");
      break;
    case "products":
      rows = await all("select p.id, p.type, p.name, p.sku, c.name as category, p.price, p.sale_price, p.stock, p.status from products p left join categories c on c.id = p.category_id order by p.id");
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
