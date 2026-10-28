import path from "node:path";
import type { NextConfig } from "next";

/** Routes retired by the five-page simplification (decision 0040) — old bookmarks and shared links land on the closest surviving page instead of a 404. */
const RETIRED_TO_DASHBOARD = ["/inventory", "/history", "/documents", "/multi-user", "/multi-channel", "/alerts", "/reporting"];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/costing",
        has: [{ type: "query", key: "id", value: "(?<id>.+)" }],
        destination: "/input?edit=:id",
        permanent: false,
      },
      { source: "/costing", destination: "/input", permanent: false },
      { source: "/catalog", destination: "/input", permanent: false },
      { source: "/ingredients", destination: "/input", permanent: false },
      { source: "/break-even", destination: "/simulator", permanent: false },
      { source: "/pos/:path*", destination: "/receipt", permanent: false },
      { source: "/documents/:path+", destination: "/dashboard", permanent: false },
      ...RETIRED_TO_DASHBOARD.map((source) => ({ source, destination: "/dashboard", permanent: false })),
    ];
  },
};

export default nextConfig;
