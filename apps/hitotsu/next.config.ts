import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // monorepo: workspace root を本アプリのディレクトリに固定
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
