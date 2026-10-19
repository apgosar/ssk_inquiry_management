import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its font metric files from disk at runtime; bundling breaks that on serverless.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
