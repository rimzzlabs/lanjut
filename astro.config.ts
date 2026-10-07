import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

const desktop = process.env.LANJUT_TARGET === "desktop";

export default defineConfig({
  site: "https://lanjut.org",
  // Separate output folders: the desktop build bakes a different target flag
  // into the bundle, so one build must never overwrite the other.
  outDir: desktop ? "dist-desktop" : "dist",
  // Pages land where their source sits: platform/editor.astro becomes
  // platform/editor.html, and id/404.astro the localized id/404.html.
  build: { format: "preserve" },
  trailingSlash: "ignore",
  server: { port: 4321 },
  devToolbar: { enabled: false },
  integrations: [
    react({
      babel: { plugins: [["babel-plugin-react-compiler", { target: "19" }]] },
    }),
  ],
  // Google, like next/font before it: the files carry the weight axis only.
  // Fontsource ships Fraunces with its optical-size axis, which narrows the
  // display headings.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-sans",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-geist-sans",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Plus Jakarta Sans",
      cssVariable: "--font-brand",
      weights: [700, 800],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Schibsted Grotesk",
      cssVariable: "--font-landing",
      weights: ["400 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Martian Mono",
      cssVariable: "--font-machine",
      weights: ["100 800"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-display",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // nextstepjs ships extensionless ESM imports, which Node cannot load
    // during prerender. Bundling it lets Vite resolve them.
    ssr: { noExternal: ["nextstepjs"] },
    environments: {
      prerender: { resolve: { noExternal: ["nextstepjs"] } },
    },
    define: {
      "import.meta.env.PUBLIC_LANJUT_TARGET": JSON.stringify(
        process.env.LANJUT_TARGET ?? "",
      ),
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          warn(warning);
        },
      },
    },
    server: {
      // The feedback relay runs in the Worker; `pnpm dev` starts it beside Astro.
      proxy: { "/api": { target: "http://localhost:8787" } },
    },
  },
});
