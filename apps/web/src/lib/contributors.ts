import { A, G, pipe, R } from "@mobily/ts-belt";
import { GITHUB_REPO } from "./github-issue";

/** The same-origin address of the contributor list the Worker keeps. */
export const CONTRIBUTORS_PATH = "/api/contributors";

const GITHUB_CONTRIBUTORS_URL = `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=100`;

/** One person who contributed to the repository, as the dashboard shows them. */
export interface Contributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

interface GithubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

function isGithubContributor(value: unknown): value is GithubContributor {
  if (!G.isObject(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    G.isString(item.login) &&
    G.isString(item.avatar_url) &&
    G.isString(item.html_url) &&
    G.isNumber(item.contributions) &&
    G.isString(item.type)
  );
}

/**
 * The people in GitHub's contributor list, most contributions first. Bots
 * (release and dependency automation) are left out: the list thanks people.
 */
export function parseGithubContributors(
  raw: unknown,
): ReadonlyArray<Contributor> {
  if (!Array.isArray(raw)) return [];
  return pipe(
    raw as unknown[],
    A.filter(isGithubContributor),
    A.filter((item) => item.type === "User"),
    A.map((item) => ({
      login: item.login,
      avatarUrl: item.avatar_url,
      profileUrl: item.html_url,
      contributions: item.contributions,
    })),
  );
}

/**
 * The repository's contributors, straight from GitHub. The Worker and the
 * site build both ask through this. A token lifts GitHub's rate limit;
 * without one the request goes out unauthenticated. A refused or failed
 * request comes back as an error value: its HTTP status, or 0 when no
 * answer came.
 */
export async function fetchGithubContributors(
  token: string | undefined,
  userAgent: string,
): Promise<R.Result<ReadonlyArray<Contributor>, number>> {
  try {
    const response = await fetch(GITHUB_CONTRIBUTORS_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": userAgent,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) return R.makeError(response.status);
    return R.makeOk(parseGithubContributors(await response.json()));
  } catch {
    return R.makeError(0);
  }
}

function isContributor(value: unknown): value is Contributor {
  if (!G.isObject(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    G.isString(item.login) &&
    G.isString(item.avatarUrl) &&
    G.isString(item.profileUrl) &&
    G.isNumber(item.contributions)
  );
}

/** The list the Worker sends, checked before the app shows any of it. */
export function parseContributors(raw: unknown): ReadonlyArray<Contributor> {
  if (!G.isObject(raw)) return [];
  const list = (raw as { contributors?: unknown }).contributors;
  if (!Array.isArray(list)) return [];
  return A.filter(list as unknown[], isContributor);
}

/**
 * Seconds from `now` to the next 00:00 UTC. The list is cached that long,
 * so it refreshes once a day, at the same moment everywhere.
 */
export function secondsUntilUtcMidnight(now: Date): number {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return Math.max(60, Math.ceil((next - now.getTime()) / 1000));
}
