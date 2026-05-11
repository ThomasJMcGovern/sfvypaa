import { NextRequest, NextResponse } from "next/server";

import {
  gateCookieName,
  gatePath,
  getSafeReturnPath,
  isGateCookieValid,
} from "@/lib/password-gate";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/api/revalidate") {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get(gateCookieName)?.value;
  const hasAccess = await isGateCookieValid(accessCookie);

  if (pathname === gatePath) {
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
  accessUrl.pathname = gatePath;
  accessUrl.search = "";
  accessUrl.searchParams.set("next", getSafeReturnPath(`${pathname}${search}`));

  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
