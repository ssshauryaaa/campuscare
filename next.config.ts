import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite /.env to our API handler so it's "accidentally" served publicly
  async rewrites() {
    return [
      { source: "/.env", destination: "/api/env-file" },
    ];
  },
};

export default nextConfig;