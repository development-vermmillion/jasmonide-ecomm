import { all, one } from "./db";

const since = (days: number, offset = 0) => `date('now','-${Math.max(0, days - 1 + offset)} day')`;

export async function overview(days: number) {
  const from = since(days), pfrom = since(days, days);
  const cnt = async (type: string, f = from, t = "9999") => (await one(`select count(distinct session) n from events where type = ? and day >= ${f} and day < ${t === "9999" ? "'9999'" : t}`, [type]))?.n || 0;
  const [sessions, prevSessions, viewers, atc, checkout, orders] = await Promise.all([
    cnt("view"), cnt("view", pfrom, since(days)), cnt("product"), cnt("atc"), cnt("checkout"),
    one(`select count(*) n, coalesce(sum(total),0) rev from orders where date(created_at) >= ${from} and status not in ('cancelled','returned')`),
  ]);
  const pageViews = (await one(`select count(*) n from events where type = 'view' and day >= ${from}`))?.n || 0;
  const devices = await all(`select device, count(distinct session) n from events where type = 'view' and day >= ${from} group by device`);

  const products = await all(
    `select p.id, p.name, p.slug, p.stock, p.track_stock, p.type, c.name cat,
       coalesce(sum(case when e.type = 'product' and e.day >= ${from} then 1 end),0) views,
       coalesce(sum(case when e.type = 'product' and e.day < ${from} then 1 end),0) prev_views,
       coalesce(sum(case when e.type = 'pclick' and e.day >= ${from} then 1 end),0) clicks,
       coalesce(sum(case when e.type = 'wish' and e.day >= ${from} then 1 end),0) wish,
       coalesce(sum(case when e.type = 'atc' and e.day >= ${from} then 1 end),0) atc,
       (select coalesce(sum(oi.qty),0) from order_items oi join orders o on o.id = oi.order_id where oi.product_id = p.id and date(o.created_at) >= ${from} and o.status not in ('cancelled','returned')) sold,
       (select round(avg(t.val)) from events t where t.type = 'time' and t.path = '/product/' || p.slug and t.day >= ${from}) secs,
       (select count(*) from notify_requests n where n.product_id = p.id and n.notified_at is null) waiting
     from products p left join categories c on c.id = p.category_id left join events e on e.product_id = p.id and e.day >= ${pfrom}
     where p.status = 'published' group by p.id`);
  for (const p of products) p.score = p.views + p.clicks + p.wish * 5 + p.atc * 8 + p.sold * 15;
  products.sort((a: any, b: any) => b.score - a.score);

  const cats = await all(
    `select c.id, c.name,
       (select count(*) from events e where e.type = 'cclick' and e.category_id = c.id and e.day >= ${from}) cclicks,
       coalesce(sum(case when e.type = 'product' then 1 end),0) views, coalesce(sum(case when e.type = 'atc' then 1 end),0) atc, coalesce(sum(case when e.type = 'wish' then 1 end),0) wish,
       (select coalesce(sum(oi.qty),0) from order_items oi join orders o on o.id = oi.order_id join products pp on pp.id = oi.product_id where pp.category_id = c.id and date(o.created_at) >= ${from} and o.status not in ('cancelled','returned')) sold
     from categories c left join events e on e.category_id = c.id and e.day >= ${from} and e.type in ('product','atc','wish') group by c.id order by views desc`);

  const searches = await all(`select label, count(*) n, round(avg(val)) results from events where type = 'search' and label != '' and day >= ${from} group by label order by n desc limit 15`);
  const noResults = await all(`select label, count(*) n from events where type = 'search' and label != '' and val = 0 and day >= ${from} group by label order by n desc limit 10`);
  const pages = await all(`select path, count(*) views, count(distinct session) visitors from events where type = 'view' and day >= ${from} group by path order by views desc limit 12`);
  const grid = await all(`select cast(strftime('%w', datetime(ts/1000,'unixepoch','+330 minutes')) as int) dow, cast(strftime('%H', datetime(ts/1000,'unixepoch','+330 minutes')) as int) hr, count(distinct session) n from events where type = 'view' and day >= ${from} group by 1,2`);
  const pin = await all(`select label, count(*) n from events where type = 'pincode' and day >= ${from} group by label`);
  const daily = await all(`select day, count(distinct session) n from events where type = 'view' and day >= ${from} group by day order by day`);

  // plain-language opportunities
  const withViews = products.filter((p: any) => p.views >= 1).map((p: any) => p.views).sort((a: number, b: number) => a - b);
  const medianViews = withViews.length ? withViews[Math.floor(withViews.length / 2)] : 0;
  const tips: { kind: string; title: string; why: string; product?: string; slug?: string }[] = [];
  for (const p of products) {
    const rate = p.views ? p.atc / p.views : 0;
    if (p.views >= Math.max(10, medianViews) && rate < 0.05 && p.sold === 0) tips.push({ kind: "fix", product: p.name, slug: p.slug, title: "Popular, but nobody adds it to the bag", why: `${p.views} views, only ${p.atc} added to bag. Check the price, photos, description and delivery info.` });
    else if (p.views >= 5 && rate >= 0.15 && p.views <= medianViews) tips.push({ kind: "promote", product: p.name, slug: p.slug, title: "Hidden gem — people who see it, want it", why: `${Math.round(rate * 100)}% add it to the bag but few people find it. Feature it on the homepage or in a reel.` });
    if (p.wish >= 3 && p.sold === 0) tips.push({ kind: "nudge", product: p.name, slug: p.slug, title: "Loved but not bought", why: `${p.wish} wishlists, 0 sales. A small coupon or a “back in stock” nudge could tip it.` });
    if (p.track_stock && p.type !== "variable" && p.stock <= 0 && (p.views >= 5 || p.waiting > 0)) tips.push({ kind: "restock", product: p.name, slug: p.slug, title: "In demand but sold out", why: `${p.views} views${p.waiting ? ` and ${p.waiting} people waiting for it` : ""}. Restock soon — you're losing sales.` });
  }
  for (const t of noResults.slice(0, 3)) tips.push({ kind: "idea", title: `People search for “${t.label}” and find nothing`, why: `${t.n} searches with no results — consider adding this product or a matching keyword.` });
  return { sessions, prevSessions, pageViews, viewers, atc, checkout, orders: orders?.n || 0, revenue: orders?.rev || 0, devices, products, cats, searches, noResults, pages, grid, pin, daily, tips: tips.slice(0, 12), hasData: pageViews > 0 };
}

export async function heatPaths(days: number) {
  return all(`select path, sum(case when type = 'view' then 1 else 0 end) views, sum(case when type = 'click' then 1 else 0 end) clicks from events where day >= ${since(days)} and path != '' and path not like '/order/%' and path not like '/invoice/%' and path not like '/account/%' group by path having views > 0 or clicks > 0 order by views desc limit 40`);
}

export async function heatData(path: string, device: string, days: number) {
  const from = since(days);
  const pts = await all(`select round(x) x, (cast(y / 12 as int) * 12) y, count(*) n from events where type = 'click' and path = ? and device = ? and day >= ${from} and x is not null and y is not null group by 1,2 order by n desc limit 3000`, [path, device]);
  const tot = (await one(`select count(*) n, count(distinct session) s from events where type = 'click' and path = ? and device = ? and day >= ${from}`, [path, device])) || { n: 0, s: 0 };
  const dim = await one(`select cast(avg(ph) as int) h from events where type = 'click' and path = ? and device = ? and day >= ${from} and ph is not null`, [path, device]);
  const labels = await all(`select label, count(*) n from events where type = 'click' and path = ? and device = ? and day >= ${from} group by label order by n desc limit 12`, [path, device]);
  const views = (await one(`select count(*) n from events where type = 'view' and path = ? and device = ? and day >= ${from}`, [path, device]))?.n || 0;
  const sc = await one(`select count(*) n, sum(val >= 25) a, sum(val >= 50) b, sum(val >= 75) c, sum(val >= 95) d from events where type = 'scroll' and path = ? and device = ? and day >= ${from}`, [path, device]);
  const secs = (await one(`select round(avg(val)) s from events where type = 'time' and path = ? and device = ? and day >= ${from}`, [path, device]))?.s || 0;
  const n = sc?.n || 0;
  return { points: pts.map((p: any) => [p.x, p.y, p.n]), clicks: tot.n, visitors: tot.s, docH: dim?.h || 0, labels, views, secs, scroll: n ? { n, p25: Math.round(((sc.a || 0) / n) * 100), p50: Math.round(((sc.b || 0) / n) * 100), p75: Math.round(((sc.c || 0) / n) * 100), p100: Math.round(((sc.d || 0) / n) * 100) } : null };
}
