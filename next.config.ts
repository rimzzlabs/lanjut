import { execSync } from "node:child_process";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const desktop = process.env.LANJUT_TARGET === "desktop";

if (!desktop) {
  initOpenNextCloudflareForDev();
}

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Separate build caches. The two targets differ in pageExtensions,
  // trailingSlash and localePrefix, so a cache written by one poisons the other.
  distDir: desktop ? ".next-desktop" : ".next",
  output: desktop ? "export" : undefined,
  trailingSlash: desktop,
  images: { unoptimized: desktop },
  pageExtensions: desktop ? ["ts", "tsx"] : ["web.ts", "web.tsx", "ts", "tsx"],
  env: {
    NEXT_PUBLIC_LANJUT_TARGET: process.env.LANJUT_TARGET,
  },
  reactCompiler: true,
};

export default function config(phase: string) {
  // Regenerate the Open Graph images before every production build, whatever the
  // entry point (next build, opennextjs-cloudflare build, CI). next/og runs here
  // on the build machine only, so its wasm never ships in the Worker bundle.
  if (!desktop && phase === PHASE_PRODUCTION_BUILD) {
    execSync("pnpm generate:og", { stdio: "inherit" });
  }

  return withNextIntl(nextConfig);
}
