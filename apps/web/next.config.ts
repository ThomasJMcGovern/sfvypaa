import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@sfvypaa/content"],
  serverExternalPackages: ["firebase-admin"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sfvypaa.org" }],
        destination: "https://sfvypaa.org/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "sfvypaa.com" }],
        destination: "https://sfvypaa.org/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sfvypaa.com" }],
        destination: "https://sfvypaa.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
