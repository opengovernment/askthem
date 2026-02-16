import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads for moderator video/audio responses
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
