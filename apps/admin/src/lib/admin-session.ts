import "server-only";

import {
  getAdmin,
  getAdminAuth,
  type Actor,
  type AdminRole,
} from "@valleypaa/content";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const adminAccessPath = "/access";
export const adminSessionCookieName = "valleypaa_admin_session";

const sessionMaxAgeMs = 60 * 60 * 24 * 14 * 1000; // 14 days

export type AdminIdentity = {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
};

function isLocalHost(host: string | null) {
  const normalizedHost = host?.toLowerCase() ?? "";

  return (
    normalizedHost.startsWith("localhost") ||
    normalizedHost.startsWith("127.0.0.1") ||
    normalizedHost.startsWith("[::1]")
  );
}

function shouldUseSecureCookie(
  host: string | null,
  forwardedProto: string | null,
) {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const proto = forwardedProto?.split(",")[0]?.trim().toLowerCase();

  if (proto === "http") {
    return false;
  }

  return proto === "https" || !isLocalHost(host);
}

export function getSafeReturnPath(value: unknown) {
  if (typeof value !== "string") {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value === adminAccessPath || value.startsWith(`${adminAccessPath}?`)) {
    return "/";
  }

  return value;
}

/**
 * Verify the Google ID token, confirm the email is on the allowlist, and mint
 * a Firebase session cookie. Throws "not-allowed" if the verified account
 * isn't a committee admin.
 */
export async function createAdminSession(
  idToken: string,
): Promise<AdminIdentity> {
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);
  const email = decoded.email?.toLowerCase();

  if (!email || decoded.email_verified === false) {
    throw new Error("not-allowed");
  }

  const admin = await getAdmin(email);

  if (!admin) {
    throw new Error("not-allowed");
  }

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: sessionMaxAgeMs,
  });

  const requestHeaders = await headers();
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, sessionCookie, {
    httpOnly: true,
    maxAge: sessionMaxAgeMs / 1000,
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureCookie(
      requestHeaders.get("host"),
      requestHeaders.get("x-forwarded-proto"),
    ),
  });

  return {
    uid: decoded.uid,
    email,
    name: admin.name,
    role: admin.role,
  };
}

/** Log out: revoke the session server-side, then clear the cookie. */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(adminSessionCookieName)?.value;

  if (sessionCookie) {
    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decoded.sub);
    } catch {
      // already invalid — just clear the cookie below
    }
  }

  cookieStore.set(adminSessionCookieName, "", { maxAge: 0, path: "/" });
}

/**
 * Resolve the current admin from the session cookie, re-checking revocation
 * and the allowlist on every call. Returns null if not signed in, revoked, or
 * removed from the allowlist.
 */
export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(adminSessionCookieName)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const email = decoded.email?.toLowerCase();

    if (!email) {
      return null;
    }

    const admin = await getAdmin(email);

    if (!admin) {
      return null;
    }

    return { uid: decoded.uid, email, name: admin.name, role: admin.role };
  } catch {
    return null;
  }
}

/** For pages: redirect to the sign-in door if not a current admin. */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(adminAccessPath);
  }

  return admin;
}

/** For owner-only pages: redirect non-owners back to the dashboard. */
export async function requireOwner(): Promise<AdminIdentity> {
  const admin = await requireAdmin();

  if (admin.role !== "owner") {
    redirect("/");
  }

  return admin;
}

export function adminToActor(admin: AdminIdentity): Actor {
  return { id: admin.email, source: "admin-ui", name: admin.name };
}
