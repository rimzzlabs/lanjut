import {
  type Locale,
  localeFromPath,
  localizePath,
  routing,
} from "@lanjut/i18n/routing";
import { appPageFor } from "../src/lib/route-rules";
import { publicPath } from "../src/lib/seo";

/** The cached page that answers a page load with no network. */
export function offlinePageKey(pathname: string): string {
  return publicPath(appPageFor(pathname) ?? pathname);
}

/** The cached 404 page in the language of `pathname`. */
export function notFoundKey(pathname: string): string {
  return localizePath("/404", localeFromPath(pathname));
}

/**
 * Where an unprefixed address goes, with no network, for a visitor who chose
 * another language. The Worker makes the same move online. Null when the
 * address stays.
 */
export function offlineLocaleTarget(
  url: URL,
  chosen: Locale | null,
): URL | null {
  if (chosen === null || chosen === routing.defaultLocale) return null;
  if (localeFromPath(url.pathname) !== routing.defaultLocale) return null;
  const target = new URL(localizePath(url.pathname, chosen), url);
  target.search = url.search;
  return target;
}
