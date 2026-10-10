import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { localizePath, routing } from "@lanjut/i18n/routing";
import { A, pipe, S } from "@mobily/ts-belt";
import type { AstroIntegration } from "astro";
import { build } from "vite";
import { publicPath } from "../src/lib/seo";
import type { PrecacheEntry } from "./precache";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ENTRY = fileURLToPath(new URL("./sw.ts", import.meta.url));

// Text for crawlers and agents, share images, the desktop splash screen, and
// Worker settings. None of them is part of the app.
const NEVER_KEPT: ReadonlyArray<RegExp> = [
  /^og\//,
  /\.md$/,
  /^llms\.txt$/,
  /^robots\.txt$/,
  /^sitemap[^/]*\.xml$/,
  /^splashscreen\.html$/,
  /^_headers$/,
  /^sw\.js$/,
];

// The PDF fonts are 10 MB, and one résumé draws with a few of them.
const KEPT_ON_USE: ReadonlyArray<RegExp> = [/^fonts\//];

const REQUIRED_PAGES = pipe(
  routing.locales,
  A.flatMap((locale) =>
    A.map(
      ["/", "/editor", "/template", "/profile", "/changelog", "/404"],
      (page) => localizePath(page, locale),
    ),
  ),
);

/**
 * Writes `sw.js` beside the build, with the list of files it keeps and their
 * revisions. Web build only: the desktop app loads its files from disk.
 */
export function serviceWorker(): AstroIntegration {
  return {
    name: "lanjut:service-worker",
    hooks: {
      "astro:build:done": async (options) => {
        const outDir = fileURLToPath(options.dir);
        const entries = await precacheEntries(outDir);
        const missing = A.reject(REQUIRED_PAGES, (page) =>
          A.some(entries, (entry) => entry.url === page),
        );
        if (!A.isEmpty(missing)) {
          throw new Error(`sw.js is missing pages: ${A.join(missing, ", ")}`);
        }
        await bundle(outDir, entries);
        const kept = A.reject(entries, (entry) => entry.lazy === true);
        options.logger.info(
          `sw.js keeps ${A.length(kept)} files, and ${A.length(entries) - A.length(kept)} more on first use`,
        );
      },
    },
  };
}

async function precacheEntries(
  outDir: string,
): Promise<ReadonlyArray<PrecacheEntry>> {
  const found = await readdir(outDir, { recursive: true, withFileTypes: true });
  const files = pipe(
    found,
    A.filter((item) => item.isFile()),
    A.map((item) =>
      pipe(relative(outDir, join(item.parentPath, item.name)), S.split(sep)),
    ),
    A.map((parts) => A.join(parts, "/")),
    A.reject((file) => A.some(NEVER_KEPT, (pattern) => pattern.test(file))),
  );
  const entries = await Promise.all(
    A.map(files, async (file) =>
      toEntry(file, await readFile(join(outDir, file))),
    ),
  );
  return A.sortBy(entries, (entry) => entry.url);
}

function toEntry(file: string, content: Buffer): PrecacheEntry {
  const lazy = A.some(KEPT_ON_USE, (pattern) => pattern.test(file));
  return {
    url: fileUrl(file),
    revision: hash(content),
    ...(lazy && { lazy: true as const }),
  };
}

/** The address a file answers at. A page drops `.html`, as the asset server does. */
function fileUrl(file: string): string {
  if (S.endsWith(file, ".html")) return publicPath(`/${file}`);
  return encodeURI(`/${file}`);
}

function hash(content: Buffer | string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

async function bundle(
  outDir: string,
  entries: ReadonlyArray<PrecacheEntry>,
): Promise<void> {
  // The same files give the same id, so an unchanged build ships an unchanged
  // sw.js and browsers download nothing again.
  const buildId = hash(
    pipe(
      entries,
      A.map((entry) => `${entry.url} ${entry.revision}`),
      A.join("\n"),
    ),
  );
  await build({
    configFile: false,
    root: ROOT,
    mode: "production",
    logLevel: "warn",
    publicDir: false,
    define: {
      __PRECACHE__: JSON.stringify(entries),
      __BUILD_ID__: JSON.stringify(buildId),
      "import.meta.env.PUBLIC_LANJUT_TARGET": JSON.stringify(""),
    },
    build: {
      outDir,
      emptyOutDir: false,
      copyPublicDir: false,
      lib: {
        entry: ENTRY,
        formats: ["iife"],
        name: "lanjutServiceWorker",
        fileName: () => "sw.js",
      },
    },
  });
}
