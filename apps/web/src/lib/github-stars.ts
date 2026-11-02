import { G, R } from "@mobily/ts-belt";
import { GITHUB_REPO } from "./github-issue";

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
