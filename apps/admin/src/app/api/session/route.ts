import { NextResponse, type NextRequest } from "next/server";

import {
  clearAdminSession,
  createAdminSession,
  getSafeReturnPath,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { idToken?: unknown; next?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 });
  }

  if (typeof body.idToken !== "string" || !body.idToken) {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 });
  }

  try {
    const admin = await createAdminSession(body.idToken);

    return NextResponse.json({
      ok: true,
      redirect: getSafeReturnPath(body.next),
      name: admin.name,
      role: admin.role,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "not-allowed") {
      return NextResponse.json({ error: "not-allowed" }, { status: 403 });
    }

    console.error("[admin] session creation failed", {
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: "sign-in-failed" }, { status: 401 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
