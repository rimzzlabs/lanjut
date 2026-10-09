import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { stripLocale } from "@lanjut/i18n/routing";
import { A, F, O, pipe } from "@mobily/ts-belt";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import type { Plugin } from "vite";
import { appPageFor, legacyTarget } from "./src/lib/route-rules";
import { INDEXED_PATHS, publicPath } from "./src/lib/seo";

const pathOf = (url: string) => publicPath(new URL(url).pathname);

const desktop = process.env.LANJUT_TARGET === "desktop";

/**
 * The Worker routes page requests in production: it forwards older addresses
 * and serves the editor page for /editor/<id>. Pages in `astro dev` never pass
 * through it, so the dev server applies the same rules here. It reads the raw
 * request, because Astro hides the query of a static page.
 */
function appRoutesInDev(): Plugin {
  return {
    name: "lanjut:app-routes",
    configureServer(server) {
      server.middlewares.use(function routeAppPage(request, response, next) {
        const url = new URL(request.url ?? "/", "http://localhost");
        const target = legacyTarget(url);
        if (target) {
          response.writeHead(301, {
            Location: `${target.pathname}${target.search}`,
          });
          response.end();
          return;
        }
        const page = appPageFor(url.pathname);
        if (page) request.url = `${page}${url.search}`;
        next();
      });
    },
  };
}

export default defineConfig({
  site: "https://lanjut.org",
  // Separate output folders: the desktop build bakes a different target flag
  // into the bundle, so one build must never overwrite the other.
  outDir: desktop ? "dist-desktop" : "dist",
  // Pages land where their source sits: template.astro becomes template.html, and id/404.astro the localized id/404.html.
  build: { format: "preserve" },
  trailingSlash: "ignore",
  server: { port: 4321 },
  devToolbar: { enabled: false },
  integrations: [
    react({
      babel: { plugins: [["babel-plugin-react-compiler", { target: "19" }]] },
    }),
    // The web build only: the desktop app is never crawled.
    ...(desktop
      ? []
      : [
          sitemap({
            filter: (page) =>
              A.includes(INDEXED_PATHS, stripLocale(pathOf(page))),
            i18n: { defaultLocale: "en", locales: { en: "en", id: "id" } },
            changefreq: "daily",
            lastmod: new Date(),
            // The landing page, in each language, gets top priority, and
            // every entry names the English page as x-default. Google reads
            // neither priority nor changefreq, only lastmod.
            serialize: (item) => ({
              ...item,
              ...(stripLocale(pathOf(item.url)) === "/" && { priority: 1 }),
              links: pipe(
                item.links ?? [],
                A.find((link) => link.lang === "en"),
                O.mapWithDefault(item.links ?? [], (english) =>
                  A.append(item.links ?? [], {
                    lang: "x-default",
                    url: english.url,
                  }),
                ),
                F.toMutable,
              ),
            }),
          }),
        ]),
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
    plugins: [tailwindcss(), appRoutesInDev()],
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
