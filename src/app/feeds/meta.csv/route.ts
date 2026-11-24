import { feedRows } from "@/lib/feeds";
import { toCSV } from "@/lib/util";

export const dynamic = "force-dynamic";

/** Catalogue feed for Meta Commerce Manager (Instagram/Facebook Shop and the WhatsApp Business catalogue). */
export async function GET() {
  const { rows, ok } = await feedRows();
  if (!ok) return new Response("Product feeds are switched off", { status: 404 });
  const csv = toCSV(rows.map((r) => ({ id: r.id, title: r.title, description: r.description, availability: r.availability, condition: "new", price: r.price, link: r.link, image_link: r.image, brand: r.brand,
    google_product_category: r.category, sale_price: r.sale_price, item_group_id: r.group })));
  return new Response(csv || "id", { headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
