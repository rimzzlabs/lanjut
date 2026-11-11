import { G, R, S } from "@mobily/ts-belt";
import { GITHUB_REPO } from "./github-issue";

/** The same-origin address of the star count the Worker keeps. */
export const STARS_PATH = "/api/stars";

const GITHUB_REPO_URL = `https://api.github.com/repos/${GITHUB_REPO}`;

/** The star count in GitHub's repository answer, or none when it is missing. */
export function parseGithubStars(raw: unknown): R.Result<number, number> {
  if (!G.isObject(raw)) return R.makeError(0);
  const stars = (raw as { stargazers_count?: unknown }).stargazers_count;
  return G.isNumber(stars) ? R.makeOk(stars) : R.makeError(0);
}

/**
 * The repository's star count, straight from GitHub. A token lifts GitHub's
 * rate limit. A refused or failed request comes back as an error value: its
 * HTTP status, or 0 when no answer came.
 */
export async function fetchGithubStars(
  token: string | undefined,
  userAgent: string,
): Promise<R.Result<number, number>> {
  try {
    const response = await fetch(GITHUB_REPO_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": userAgent,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) return R.makeError(response.status);
    return parseGithubStars(await response.json());
  } catch {
    return R.makeError(0);
  }
}

/** The count the Worker sends, checked before the page shows it. */
export function parseStars(raw: unknown): R.Result<number, number> {
  if (!G.isObject(raw)) return R.makeError(0);
  const stars = (raw as { stars?: unknown }).stars;
  return G.isNumber(stars) ? R.makeOk(stars) : R.makeError(0);
}

/** The count as the pages show it: 115, 1.2K. */
export function formatStars(locale: string, count: number): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}

/**
 * The accessible name of the GitHub link, from the raw `nav.githubStars`
 * message. The browser fills it in without the message catalog.
 */
export function starsName(
  template: string,
  locale: string,
  count: number,
): string {
  return S.replace(
    template,
    "{count}",
    new Intl.NumberFormat(locale).format(count),
  );
}
