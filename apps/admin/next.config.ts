import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sfvypaa/content"],
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
