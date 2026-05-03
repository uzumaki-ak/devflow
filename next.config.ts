import type { NextConfig } from "next";

// next.config.ts
// next 16 ships with turbopack stable by default so no extra flag needed.
// reactCompiler is stable in next 16 but off by default — leaving it off here
// until we've done proper testing on the codebase.

const nextConfig: NextConfig = {
  // images from external domains if we ever add avatars
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // experimental features we want for this project
  experimental: {
    // react compiler — keep off for now, not tested
    // reactCompiler: true,
  },
};

export default nextConfig;
