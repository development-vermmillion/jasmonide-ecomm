import { feedRows } from "@/lib/feeds";
import { getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";
const x = (v: string) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const { rows, base, ok } = await feedRows();
  if (!ok) return new Response("Product feeds are switched off", { status: 404 });
  const s = await getSettings();
  const items = rows.map((r) => `<item>
<g:id>${x(r.id)}</g:id><title>${x(r.title)}</title><description>${x(r.description)}</description><link>${x(r.link)}</link><g:image_link>${x(r.image)}</g:image_link>
<g:availability>${r.availability}</g:availability><g:price>${r.price}</g:price>${r.sale_price ? `<g:sale_price>${r.sale_price}</g:sale_price>` : ""}
<g:brand>${x(r.brand)}</g:brand><g:condition>new</g:condition><g:identifier_exists>no</g:identifier_exists>${r.group ? `<g:item_group_id>${r.group}</g:item_group_id>` : ""}
${r.category ? `<g:google_product_category>${x(r.category)}</g:google_product_category>` : ""}${r.ptype ? `<g:product_type>${x(r.ptype)}</g:product_type>` : ""}${r.weight ? `<g:shipping_weight>${x(r.weight)}</g:shipping_weight>` : ""}
</item>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>${x(s.store_name)}</title><link>${x(base || "/")}</link><description>${x(s.site_description)}</description>\n${items}\n</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
