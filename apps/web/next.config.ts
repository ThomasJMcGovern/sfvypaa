import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@valleypaa/content"],
  serverExternalPackages: ["firebase-admin"],
  async redirects() {
    // Canonicalize www → apex on the live domain, and 301 every legacy
    // sfvypaa.org / sfvypaa.com host to the new valleypaa.org so existing
    // links and search results keep working through the cutover window.
    const legacyHosts = [
      "www.valleypaa.org",
      "sfvypaa.org",
      "www.sfvypaa.org",
      "sfvypaa.com",
      "www.sfvypaa.com",
    ];
    return legacyHosts.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: "https://valleypaa.org/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
