import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { ISLAND_NAMESPACES } from "@lanjut/i18n/island-messages";
import { routing } from "@lanjut/i18n/routing";
import { A, D, pipe } from "@mobily/ts-belt";
import type { Plugin } from "vite";

const ID = "virtual:lanjut/island-messages";
const RESOLVED_ID = `\0${ID}`;
const require = createRequire(import.meta.url);

/**
 * Writes the copy that the landing islands read as a module of its own. The
 * app imports each catalog whole, and a bundler never splits one module
 * between chunks, so even a named import from a catalog would bring all of it
 * to the landing page.
 */
export function islandMessages(): Plugin {
  return {
    name: "lanjut:island-messages",
    resolveId(id) {
      return id === ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const messages = pipe(
        routing.locales,
        A.map((locale) => {
          const file = require.resolve(`@lanjut/i18n/messages/${locale}.json`);
          this.addWatchFile(file);
          const catalog: Record<string, unknown> = JSON.parse(
            readFileSync(file, "utf8"),
          );
          return [locale, D.selectKeys(catalog, ISLAND_NAMESPACES)] as const;
        }),
        D.fromPairs,
      );
      return `export const ISLAND_MESSAGES = ${JSON.stringify(messages)};`;
    },
  };
}
