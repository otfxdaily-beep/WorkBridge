import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Optimistic check only: it just looks for the session cookie so logged-out
 * visitors are bounced before hitting the database. The real authorization
 * (role, suspension, expiry) is re-checked server-side against the database
 * in every protected layout — this never decides who is actually allowed in.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employer/:path*", "/admin/:path*"],
};
