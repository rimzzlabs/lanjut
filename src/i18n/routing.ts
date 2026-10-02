import { A, pipe, S } from "@mobily/ts-belt";

export const routing = {
  locales: ["en", "id"],
  defaultLocale: "en",
} as const;

/** Remembers the visitor's language choice for the Worker's redirect. */
export const LOCALE_COOKIE = "locale";

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: unknown): value is Locale {
  return A.includes(routing.locales, value as Locale);
}

const LOCALE_PREFIX = /^\/id(?=\/|$)/;

/**
 * Drops the locale prefix and any trailing slash: `/id/platform/` becomes
 * `/platform`.
 */
export function stripLocale(pathname: string): string {
  return (
    pipe(
      pathname,
      S.replaceByRe(LOCALE_PREFIX, ""),
      S.replaceByRe(/\/+$/, ""),
    ) || "/"
  );
}

export function localeFromPath(pathname: string): Locale {
  return LOCALE_PREFIX.test(pathname) ? "id" : routing.defaultLocale;
}

/**
 * Prefixes a path for a locale. The default locale has no prefix, on the web
 * and in the desktop app alike.
 */
export function localizePath(href: string, locale: Locale): string {
  const path = stripLocale(href);
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** `getStaticPaths` entries for a page that exists in every locale. */
export function localeStaticPaths() {
  return A.map(routing.locales, (locale) => ({
    params: { lang: locale === routing.defaultLocale ? undefined : locale },
    props: { locale },
  }));
}
