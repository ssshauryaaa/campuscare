import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // ← add this
  async rewrites() {
    return [
      { source: "/.env", destination: "/api/env-file" },
    ];
  },
};

export default nextConfig;