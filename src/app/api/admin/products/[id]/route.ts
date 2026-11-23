import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/products-admin";
import { run, one } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ ok: true, ...(await saveProduct(await req.json(), Number(params.id))) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const used = await one("select count(*) n from combo_items where product_id = ?", [id]);
  if (used?.n > 0) return NextResponse.json({ ok: false, error: "This product is part of a combo. Remove it from the combo first." }, { status: 400 });
  await run("delete from products where id = ?", [id]);
  return NextResponse.json({ ok: true });
}
