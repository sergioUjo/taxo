import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8321/api/:path*",
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
