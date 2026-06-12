import { createHash, timingSafeEqual } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

const secretHeader = "x-sfvypaa-revalidate-secret";

// Constant-time secret comparison. Hashing both sides to a fixed-length digest
// means timingSafeEqual never throws on length mismatch and leaks no length info.
function secretsMatch(provided: string | null, configured: string) {
  if (!provided) {
    return false;
  }

  const providedDigest = createHash("sha256").update(provided).digest();
  const configuredDigest = createHash("sha256").update(configured).digest();

  return timingSafeEqual(providedDigest, configuredDigest);
}
const newsletterSlugPathPattern = /^\/newsletters\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

type RevalidateBody = {
  paths?: unknown;
};

function allowedPath(path: string) {
  return (
    path === "/" ||
    path === "/newsletters" ||
    newsletterSlugPathPattern.test(path)
  );
}

function cleanPaths(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter((path): path is string => typeof path === "string")
        .map((path) => path.trim())
        .filter(Boolean),
    ),
  ];
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.SFVYPAA_REVALIDATE_SECRET;
  const providedSecret = request.headers.get(secretHeader);

  if (!configuredSecret || !secretsMatch(providedSecret, configuredSecret)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateBody;

  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const paths = cleanPaths(body.paths);
  const invalidPaths = paths.filter((path) => !allowedPath(path));

  if (paths.length === 0 || invalidPaths.length > 0) {
    return NextResponse.json(
      { message: "Invalid revalidation paths", invalidPaths },
      { status: 400 },
    );
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: paths });
}
