import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
        search: "",
      },
      {
        pathname: "/uploads/**",
        search: "",
      },
      {
        pathname: "/images/products/cameras/**",
        search: "?v=20261007-camera-refresh-1",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
