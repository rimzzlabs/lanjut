import { A, G, O, pipe, S } from "@mobily/ts-belt";

/** A link the PDF carries: where it goes, and the text drawn under it. */
export interface PdfLink {
  url: string;
  label: string;
}

const SCHEME_URL_G_RE = /(?:https?:\/\/|www\.)[^\s|<>"]+/gi;
// A domain with a path, such as github.com/name. Lowercase only, so a name
// such as Socket.IO in running text is not read as an address. The leading
// character keeps an email's domain out.
const PATH_URL_G_RE = /(?:^|[^@\w.])(?:[a-z\d-]+\.)+[a-z]{2,}\/[^\s|<>"]*/g;
const BARE_DOMAIN_RE = /^(?:[a-z\d-]+\.)+[a-z]{2,}$/;
const TRAILING_RE = /[.,;:!?)\]}>»"'”’•·]+$/;

export function cleanUrl(raw: string): string {
  return pipe(
    raw,
    S.trim,
    S.replaceByRe(/^[^a-z\d]+/i, ""),
    S.replaceByRe(TRAILING_RE, ""),
  );
}

function matchesOf(text: string, pattern: RegExp): ReadonlyArray<string> {
  return pipe(
    O.getWithDefault(S.match(text, pattern), []),
    A.filter(G.isString),
  );
}

/** Every web address in a line: with a scheme, with www, or a domain with a path. */
export function findUrls(text: string): ReadonlyArray<string> {
  const withScheme = matchesOf(text, SCHEME_URL_G_RE);
  const withPath = matchesOf(
    S.replaceByRe(text, SCHEME_URL_G_RE, " "),
    PATH_URL_G_RE,
  );
  return pipe(
    A.concat(withScheme, withPath),
    A.map(cleanUrl),
    A.reject(S.isEmpty),
    A.uniq,
  );
}

/**
 * A token that is an address on its own. A bare domain such as rizki.dev
 * counts only where asked: in running text, next.js and socket.io are tools.
 */
export function isUrlToken(token: string, bareDomains: boolean): boolean {
  const cleaned = cleanUrl(token);
  if (S.isEmpty(cleaned)) return false;
  if (bareDomains && BARE_DOMAIN_RE.test(cleaned)) return true;
  return O.mapWithDefault(
    A.head(findUrls(cleaned)),
    false,
    (url) => url === cleaned,
  );
}

/** One spelling per address, so github.com/x and https://www.github.com/x/ match. */
export function urlKey(url: string): string {
  return pipe(
    url,
    S.toLowerCase,
    S.replaceByRe(/^(?:https?:\/\/)?(?:www\.)?/, ""),
    S.replaceByRe(/\/+$/, ""),
  );
}
