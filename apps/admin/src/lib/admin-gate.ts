export const adminCookieName = "sfvypaa_admin_access";
export const adminAccessPath = "/access";

const adminTokenPayload = "sfvypaa-admin-gate-v1";

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function getAdminPassword() {
  return process.env.SFVYPAA_ADMIN_PASSWORD ?? "";
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

export async function createAdminToken(secret = getAdminPassword()) {
  if (!secret) {
    return "";
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(adminTokenPayload),
  );

  return toBase64Url(signature);
}

export async function isAdminCookieValid(value: string | undefined) {
  if (!value) {
    return false;
  }

  const expectedValue = await createAdminToken();

  return Boolean(expectedValue) && value === expectedValue;
}
