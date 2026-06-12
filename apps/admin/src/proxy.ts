import { NextRequest, NextResponse } from "next/server";

import {
  adminAccessPath,
  adminSessionCookieName,
  getSafeReturnPath,
} from "@/lib/admin-session";

// Lightweight UX gate: bounce to the sign-in door when no session cookie is
// present. The authoritative check (verify cookie + allowlist + revocation)
// runs in every page and server action via requireAdmin(), so this is not the
// sole auth layer.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The sign-in door and the session endpoint must be reachable signed-out.
  if (pathname === adminAccessPath || pathname.startsWith("/api/session")) {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const accessUrl = request.nextUrl.clone();
  accessUrl.pathname = adminAccessPath;
  accessUrl.search = "";
  accessUrl.searchParams.set("next", getSafeReturnPath(`${pathname}${search}`));

  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
