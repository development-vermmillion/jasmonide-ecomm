import { all, one } from "./db";

const TZ = Number(process.env.TZ_OFFSET_MIN ?? 330); // minutes from UTC used to group orders into days (default IST)
export const dayExpr = (col = "o.created_at") => `date(${col}, '${TZ >= 0 ? "+" : ""}${TZ} minutes')`;
const LIVE = "o.status not in ('cancelled','returned')";

export function rangeDates(days: number) {
  const end = new Date(Date.now() + TZ * 60000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const f = (d: Date) => d.toISOString().slice(0, 10);
  return { from: f(start), to: f(end) };
}

export async function dashboardStats(days: number) {
  const { from, to } = rangeDates(days);
  const prevFrom = rangeDates(days * 2).from;
  const prevTo = new Date(new Date(from).getTime() - 86400000).toISOString().slice(0, 10);

  const agg = (a: string, b: string) =>
    one(`select coalesce(sum(o.total),0) as revenue, count(*) as orders, coalesce(avg(o.total),0) as aov
         from orders o where ${LIVE} and ${dayExpr()} between ? and ?`, [a, b]);
  const [cur, prev] = await Promise.all([agg(from, to), agg(prevFrom, prevTo)]);

  const daily = await all(`select ${dayExpr()} as d, sum(o.total) as revenue, count(*) as orders from orders o where ${LIVE} and ${dayExpr()} between ? and ? group by d`, [from, to]);
  const series: { date: string; revenue: number; orders: number }[] = [];
  for (let t = new Date(from).getTime(); t <= new Date(to).getTime(); t += 86400000) {
    const d = new Date(t).toISOString().slice(0, 10);
    const row = daily.find((x: any) => x.d === d);
    series.push({ date: d, revenue: row?.revenue || 0, orders: row?.orders || 0 });
  }

  // previous period, aligned day-by-day for the comparison line
  const prevDaily = await all(`select ${dayExpr()} as d, sum(o.total) as revenue, count(*) as orders from orders o where ${LIVE} and ${dayExpr()} between ? and ? group by d`, [prevFrom, prevTo]);
  const prevSeries: { date: string; revenue: number; orders: number }[] = [];
  for (let t = new Date(prevFrom).getTime(); t <= new Date(prevTo).getTime(); t += 86400000) {
    const d = new Date(t).toISOString().slice(0, 10);
    const row = prevDaily.find((x: any) => x.d === d);
    prevSeries.push({ date: d, revenue: row?.revenue || 0, orders: row?.orders || 0 });
  }

  // 22-week order heatmap (independent of the selected period)
  const hr = rangeDates(154);
  const heatRows = await all(`select ${dayExpr()} as d, count(*) n, sum(o.total) revenue from orders o where ${LIVE} and ${dayExpr()} between ? and ? group by d`, [hr.from, hr.to]);
  const heat: { date: string; n: number; revenue: number }[] = [];
  for (let t = new Date(hr.from).getTime(); t <= new Date(hr.to).getTime(); t += 86400000) {
    const d = new Date(t).toISOString().slice(0, 10);
    const row = heatRows.find((x: any) => x.d === d);
    heat.push({ date: d, n: row?.n || 0, revenue: row?.revenue || 0 });
  }

  // order flow + health per payment method
  const flowRows = await all(`select o.payment_method m, count(*) placed,
      sum(case when o.payment_status = 'paid' then 1 else 0 end) paid,
      sum(case when o.status in ('shipped','delivered') then 1 else 0 end) shipped,
      sum(case when o.status = 'delivered' then 1 else 0 end) delivered,
      sum(case when o.status = 'cancelled' then 1 else 0 end) cancelled,
      sum(case when o.status = 'returned' then 1 else 0 end) returned,
      avg(case when o.status = 'delivered' and o.delivered_at is not null then julianday(o.delivered_at) - julianday(o.created_at) end) days
    from orders o where ${dayExpr()} between ? and ? group by o.payment_method`, [from, to]);
  const sum = (k: string, rows = flowRows) => rows.reduce((a: number, r: any) => a + (r[k] || 0), 0);
  const mk = (rows: any[]) => {
    const placed = sum("placed", rows), dd = rows.filter((r: any) => r.days != null);
    return { placed, paid: sum("paid", rows), shipped: sum("shipped", rows), delivered: sum("delivered", rows), cancelled: sum("cancelled", rows), returned: sum("returned", rows),
      days: dd.length ? dd.reduce((a: number, r: any) => a + r.days * r.delivered, 0) / Math.max(1, dd.reduce((a: number, r: any) => a + r.delivered, 0)) : null };
  };
  const health: Record<string, ReturnType<typeof mk>> = { all: mk(flowRows) };
  for (const m of ["upi", "cod", "online"]) health[m] = mk(flowRows.filter((r: any) => r.m === m));

  const [statuses, payments, topProducts, topCats, lowStock, recent, customers, pending, inventory, newCust, sale] = await Promise.all([
    all(`select o.status, count(*) n, sum(o.total) total from orders o where ${dayExpr()} between ? and ? group by o.status`, [from, to]),
    all(`select o.payment_method m, count(*) n, sum(o.total) total from orders o where ${LIVE} and ${dayExpr()} between ? and ? group by o.payment_method`, [from, to]),
    all(`select oi.name, sum(oi.qty) units, sum(oi.qty*oi.price) revenue from order_items oi join orders o on o.id = oi.order_id
         where ${LIVE} and ${dayExpr()} between ? and ? group by oi.name order by revenue desc limit 6`, [from, to]),
    all(`select coalesce(c.name,'Uncategorised') name, sum(oi.qty*oi.price) revenue from order_items oi join orders o on o.id = oi.order_id
         left join products p on p.id = oi.product_id left join categories c on c.id = p.category_id
         where ${LIVE} and ${dayExpr()} between ? and ? group by c.id order by revenue desc limit 6`, [from, to]),
    all(`select * from (
           select p.id as product_id, null as variant_id, p.name, '' as variant, p.stock, p.low_stock from products p where p.type='simple' and p.track_stock=1 and p.status='published'
           union all select p.id, v.id, p.name, v.name, v.stock, p.low_stock from variants v join products p on p.id=v.product_id where p.track_stock=1 and p.status='published'
         ) where stock <= low_stock order by stock asc limit 8`),
    all(`select o.id, o.number, o.name, o.total, o.status, o.payment_status, o.created_at from orders o order by o.id desc limit 7`),
    one("select count(*) n from customers"),
    one("select count(*) n from orders where status in ('pending','confirmed','processing')"),
    one(`select coalesce(sum(stock*price),0) v from products where type='simple' and track_stock=1`),
    one(`select count(*) n from customers where ${dayExpr("created_at")} between ? and ?`, [from, to]),
    one("select count(*) n from products where sale_price is not null and status='published'"),
  ]);
  const vinv = await one("select coalesce(sum(v.stock*v.price),0) v from variants v join products p on p.id=v.product_id where p.track_stock=1");

  return {
    from, to, cur, prev, series, prevSeries, heat, health, statuses, payments, topProducts, topCats, lowStock, recent,
    totalCustomers: customers.n, newCustomers: newCust.n, openOrders: pending.n, stockValue: (inventory.v || 0) + (vinv?.v || 0), onSale: sale.n,
  };
}
