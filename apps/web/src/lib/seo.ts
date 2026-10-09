import { type Locale, localizePath, routing } from "@lanjut/i18n/routing";
import { A, pipe, S } from "@mobily/ts-belt";
import { SITE } from "./site";

/**
 * A built page's public path. With `build.format: "preserve"`, Astro reports
 * `/feedback.html` and `/id/`, and the asset server answers both with a
 * redirect to `/feedback` and `/id`; canonical links and hreflang must name
 * the address that answers 200.
 */
export function publicPath(pathname: string): string {
  return (
    pipe(
      pathname,
      S.replaceByRe(/(?:\/index)?\.html$/, ""),
      S.replaceByRe(/\/+$/, ""),
    ) || "/"
  );
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

/**
 * The pages search engines may index, as unlocalized paths. The editor and
 * the templates are where a visitor starts, so they are listed; `/profile`
 * holds nothing but the visitor's own data, so it stays out.
 */
export const INDEXED_PATHS: ReadonlyArray<string> = [
  "/",
  "/editor",
  "/template",
  "/feedback",
];

/** A page's address in every language, for hreflang and the sitemap. */
export function alternatesOf(path: string) {
  return A.map(routing.locales, (locale: Locale) => ({
    hreflang: locale,
    href: absoluteUrl(localizePath(path, locale)),
  }));
}

export function defaultAlternateOf(path: string): string {
  return absoluteUrl(localizePath(path, routing.defaultLocale));
}
