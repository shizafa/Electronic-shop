import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Windows resolves "localhost" to the IPv6 loopback ([::1]) for the browser even when the
  // dev server is started with no -H flag, which Next's dev cross-origin guard doesn't
  // allowlist by default — every _next/static and HMR request then gets silently blocked,
  // leaving the page stuck on its Suspense/loading fallbacks forever.
  allowedDevOrigins: ["localhost", "127.0.0.1", "[::1]"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
