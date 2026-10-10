import {
  isLocale,
  LOCALE_COOKIE,
  type Locale,
  localeFromPath,
  localizePath,
  routing,
} from "@lanjut/i18n/routing";
import { A, G, O, pipe, S } from "@mobily/ts-belt";
import { PRECACHE_HEADER } from "../src/lib/route-rules";

function cookieLocale(header: string | null): Locale | null {
  if (!G.isString(header)) return null;
  const value = pipe(
    S.match(header, new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`)),
    O.flatMap(A.get(1)),
  );
  return isLocale(value) ? value : null;
}

/** The first supported language in the header, by quality. */
function acceptedLocale(header: string | null): Locale | null {
  const ranked = pipe(
    header ?? "",
    S.split(","),
    A.map((part) => {
      const [tag, ...params] = pipe(part, S.trim, S.split(";"));
      const q = A.find(params, (param) =>
        pipe(param, S.trim, S.startsWith("q=")),
      );
      return {
        language: pipe(tag, S.toLowerCase, S.split("-"), A.head),
        quality: O.mapWithDefault(q, 1, (found) =>
          Number(pipe(found, S.trim, S.sliceToEnd(2))),
        ),
      };
    }),
    A.filter((entry) => entry.quality > 0),
    A.sort((a, b) => b.quality - a.quality),
  );

  const language = pipe(
    A.find(ranked, (entry) => isLocale(entry.language)),
    O.flatMap((entry) => entry.language),
  );
  return isLocale(language) ? language : null;
}

/**
 * Sends a visitor on an unprefixed page to their language. A choice made with
 * the language switcher wins over the browser's languages.
 */
export function localeRedirect(request: Request, url: URL): Response | null {
  if (request.headers.has(PRECACHE_HEADER)) return null;
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
