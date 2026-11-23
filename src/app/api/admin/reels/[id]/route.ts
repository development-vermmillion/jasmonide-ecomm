import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { reelValues } from "../route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await run("update reels set title=?, url=?, thumb=?, video_url=?, product_id=?, show_home=?, status=?, sort=? where id=?", [...reelValues(await req.json()), Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from reels where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
