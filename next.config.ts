import { execSync } from "node:child_process";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default function config(phase: string) {
  // Regenerate the Open Graph images before every production build, whatever the
  // entry point (next build, opennextjs-cloudflare build, CI). next/og runs here
  // on the build machine only, so its wasm never ships in the Worker bundle.
  if (phase === PHASE_PRODUCTION_BUILD) {
    execSync("pnpm generate:og", { stdio: "inherit" });
  }

  return withNextIntl(nextConfig);
}
