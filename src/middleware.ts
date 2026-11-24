import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/auth";
import { canViewPage, canCallApi } from "@/lib/roles";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const session = await verifyToken(req.cookies.get(COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canCallApi(session.role, pathname, req.method)) return NextResponse.json({ ok: false, error: "Your role doesn't allow this" }, { status: 403 });
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin")) {
    if (!session && !isLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (session && isLogin) return NextResponse.redirect(new URL("/admin", req.url));
    if (session && !canViewPage(session.role, pathname)) return NextResponse.redirect(new URL("/admin?denied=1", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
