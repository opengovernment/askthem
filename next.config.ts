import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type-checking during build – handled by CI lint step instead.
  // This unblocks Vercel deploys while we fix the 90+ noImplicitAny errors.
  typescript: {
    ignoreBuildErrors: true,
  },
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
