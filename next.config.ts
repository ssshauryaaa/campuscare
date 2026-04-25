import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/.env", destination: "/api/env-file" },
    ];
  },
};

export default nextConfig;