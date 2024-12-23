import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "ireland.apollo.olxcdn.com",
      },
    ],
  },
};

export default nextConfig;
