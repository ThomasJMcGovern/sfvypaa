import { NextRequest, NextResponse } from "next/server";

import {
  adminAccessPath,
  adminCookieName,
  getSafeReturnPath,
  isAdminCookieValid,
} from "@/lib/admin-gate";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessCookie = request.cookies.get(adminCookieName)?.value;
  const hasAccess = await isAdminCookieValid(accessCookie);

  if (pathname === adminAccessPath) {
    if (!hasAccess) {
      return NextResponse.next();
    }

    const nextPath = getSafeReturnPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (hasAccess) {
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
