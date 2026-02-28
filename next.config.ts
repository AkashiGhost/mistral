import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel's NFT (Node File Tracing) uses static analysis to determine which
  // files serverless functions need. Since story paths are computed at runtime
  // (e.g., `path.join(process.cwd(), "stories", storyId)`), the tracer misses
  // story directories that aren't the default. Explicitly include them all.
  outputFileTracingIncludes: {
    "/api/**": ["./stories/**/*", "./schemas/**/*"],
  },
};

export default nextConfig;
