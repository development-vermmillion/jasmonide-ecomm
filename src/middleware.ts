import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const session = await verifyToken(req.cookies.get(COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin")) {
    if (!session && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (session && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
