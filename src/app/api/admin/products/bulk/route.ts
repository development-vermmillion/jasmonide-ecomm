import { NextResponse } from "next/server";
import { run, one } from "@/lib/db";

export async function POST(req: Request) {
  const { ids, action } = await req.json();
  if (!Array.isArray(ids) || !ids.length) return NextResponse.json({ ok: false, error: "Nothing selected" }, { status: 400 });
  const ph = ids.map(() => "?").join(",");
  if (action === "publish") await run(`update products set status='published' where id in (${ph})`, ids);
  else if (action === "draft") await run(`update products set status='draft' where id in (${ph})`, ids);
  else if (action === "feature") await run(`update products set featured=1 where id in (${ph})`, ids);
  else if (action === "unfeature") await run(`update products set featured=0 where id in (${ph})`, ids);
  else if (action === "delete") {
    const used = await one(`select count(*) n from combo_items where product_id in (${ph})`, ids);
    if (used?.n > 0) return NextResponse.json({ ok: false, error: "Some selected products are inside combos. Remove them from those combos first." }, { status: 400 });
    await run(`delete from products where id in (${ph})`, ids);
  } else return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
