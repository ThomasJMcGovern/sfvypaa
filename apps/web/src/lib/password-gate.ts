export const gateCookieName = "sfvypaa_site_access";
export const gatePath = "/access";

const gateTokenPayload = "sfvypaa-password-gate-v1";

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

export function getSitePassword() {
  return process.env.SFVYPAA_SITE_PASSWORD ?? "";
}

function isLocalHost(host: string | null) {
  const normalizedHost = host?.toLowerCase() ?? "";

  return (
    normalizedHost.startsWith("localhost") ||
    normalizedHost.startsWith("127.0.0.1") ||
    normalizedHost.startsWith("[::1]")
  );
}

export function shouldUseSecureGateCookie(
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

  if (value === gatePath || value.startsWith(`${gatePath}?`)) {
    return "/";
  }

  return value;
}

export async function createGateToken(secret = getSitePassword()) {
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
    encoder.encode(gateTokenPayload),
  );

  return toBase64Url(signature);
}

export async function isGateCookieValid(value: string | undefined) {
  if (!value) {
    return false;
  }

  const expectedValue = await createGateToken();

  return Boolean(expectedValue) && value === expectedValue;
}
