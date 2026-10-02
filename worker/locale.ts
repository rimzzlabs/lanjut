import {
  isLocale,
  LOCALE_COOKIE,
  type Locale,
  localeFromPath,
  localizePath,
  routing,
} from "../src/i18n/routing";

function cookieLocale(header: string | null): Locale | null {
  const match = header?.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  return isLocale(match?.[1]) ? match[1] : null;
}

/** The first supported language in the header, by quality. */
function acceptedLocale(header: string | null): Locale | null {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return {
        language: tag.toLowerCase().split("-")[0],
        quality: q ? Number(q.trim().slice(2)) : 1,
      };
    })
    .filter((entry) => entry.quality > 0)
    .toSorted((a, b) => b.quality - a.quality);

  const match = ranked.find((entry) => isLocale(entry.language));
  return match && isLocale(match.language) ? match.language : null;
}

/**
 * Sends a visitor on an unprefixed page to their language. A choice made with
 * the language switcher wins over the browser's languages.
 */
export function localeRedirect(request: Request, url: URL): Response | null {
  if (localeFromPath(url.pathname) !== routing.defaultLocale) return null;

  const preferred =
    cookieLocale(request.headers.get("cookie")) ??
    acceptedLocale(request.headers.get("accept-language"));
  if (!preferred || preferred === routing.defaultLocale) return null;

  const target = new URL(localizePath(url.pathname, preferred), url);
  target.search = url.search;
  return new Response(null, {
    status: 307,
    headers: { Location: target.href, Vary: "Cookie, Accept-Language" },
  });
}
