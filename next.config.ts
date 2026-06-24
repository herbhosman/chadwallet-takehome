import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@solana/kit",
    "@solana-program/memo",
    "@solana-program/system",
    "@solana-program/token",
  ],
};

export default nextConfig;
