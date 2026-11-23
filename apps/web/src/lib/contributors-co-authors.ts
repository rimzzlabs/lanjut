import { A, D, F, G, O, pipe, R, S } from "@mobily/ts-belt";
import type { Contributor } from "./contributors";
import { GITHUB_REPO } from "./github-issue";

// GitHub's contributor list counts commit authors only. A squash merge names
// the other people of a pull request in Co-authored-by trailers, so the
// commits that carry one are searched for here. Release-please merges carry a
// bot trailer on every release, so the query leaves those commits out.
const GITHUB_CO_AUTHORS_URL = `https://api.github.com/search/commits?per_page=100&q=${encodeURIComponent(
  `repo:${GITHUB_REPO} "co-authored-by" NOT "github-actions"`,
)}`;

// Only a GitHub noreply address names an account: `<id>+<login>@` or, for
// older accounts, `<login>@`. Any other address cannot be tied to a profile.
const TRAILER =
  /^co-authored-by:.*<(?:\d+\+)?([a-z\d-]+(?:\[bot\])?)@users\.noreply\.github\.com>\s*$/i;

interface CoAuthor {
  login: string;
}

function readTrailer(line: string): O.Option<CoAuthor> {
  const match = TRAILER.exec(S.trim(line));
  if (!match) return O.None;
  const login = match[1];
  if (!login || S.endsWith(login, "[bot]")) return O.None;
  return O.Some({ login });
}

function commitMessage(item: unknown): O.Option<string> {
  if (!G.isObject(item)) return O.None;
  const commit = (item as { commit?: unknown }).commit;
  if (!G.isObject(commit)) return O.None;
  const message = (commit as { message?: unknown }).message;
  return G.isString(message) ? O.Some(message) : O.None;
}

function toContributor(group: ReadonlyArray<CoAuthor>): O.Option<Contributor> {
  return O.map(A.head(group), (first) => ({
    login: first.login,
    avatarUrl: `https://github.com/${first.login}.png`,
    profileUrl: `https://github.com/${first.login}`,
    contributions: A.length(group),
  }));
}

/** The people named in Co-authored-by trailers, one entry per account. */
export function parseGithubCoAuthors(raw: unknown): ReadonlyArray<Contributor> {
  if (!G.isObject(raw)) return [];
  const items = (raw as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return pipe(
    items as unknown[],
    A.filterMap(commitMessage),
    A.flatMap((message) =>
      pipe(S.split(message, "\n"), A.filterMap(readTrailer)),
    ),
    A.groupBy((coAuthor) => S.toLowerCase(coAuthor.login)),
    D.values,
    A.filterMap(toContributor),
  );
}

/**
 * Adds the co-authors to GitHub's list. A person already in the list gets
 * the co-authored commits added to their count. The list stays ordered by
 * contributions, most first.
 */
export function mergeCoAuthors(
  authors: ReadonlyArray<Contributor>,
  coAuthors: ReadonlyArray<Contributor>,
): ReadonlyArray<Contributor> {
  const extra = D.fromPairs(
    A.map(coAuthors, (coAuthor) => [S.toLowerCase(coAuthor.login), coAuthor]),
  );
  const known = pipe(
    authors,
    A.map((author) => S.toLowerCase(author.login)),
  );
  return pipe(
    authors,
    A.map((author) =>
      pipe(
        D.get(extra, S.toLowerCase(author.login)),
        O.mapWithDefault(author, (coAuthor) => ({
          ...author,
          contributions: author.contributions + coAuthor.contributions,
        })),
      ),
    ),
    A.concat(
      A.reject(coAuthors, (coAuthor) =>
        A.includes(known, S.toLowerCase(coAuthor.login)),
      ),
    ),
    A.sortBy((contributor) => -contributor.contributions),
  );
}

function githubHeaders(token: string | undefined, userAgent: string) {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": userAgent,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

interface GithubUser {
  avatar_url: string;
  html_url: string;
  type: string;
}

function isGithubUser(value: unknown): value is GithubUser {
  if (!G.isObject(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    G.isString(item.avatar_url) &&
    G.isString(item.html_url) &&
    G.isString(item.type)
  );
}

/**
 * The co-author with GitHub's own avatar and profile, or None when the
 * account is not a person. Some apps co-author under a name with no `[bot]`
 * in it, so only the account type tells them apart. An account that cannot be
 * looked up is left out too.
 */
async function confirmPerson(
  coAuthor: Contributor,
  headers: Record<string, string>,
): Promise<O.Option<Contributor>> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(coAuthor.login)}`,
      { headers },
    );
    if (!response.ok) return O.None;
    const user: unknown = await response.json();
    if (!isGithubUser(user) || user.type !== "User") return O.None;
    return O.Some({
      ...coAuthor,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
    });
  } catch {
    return O.None;
  }
}

/**
 * The people among the co-authors of the repository's commits, from GitHub's
 * commit search. A failed search comes back as an error value, as the
 * contributor list does.
 */
export async function fetchGithubCoAuthors(
  token: string | undefined,
  userAgent: string,
): Promise<R.Result<ReadonlyArray<Contributor>, number>> {
  const headers = githubHeaders(token, userAgent);
  try {
    const response = await fetch(GITHUB_CO_AUTHORS_URL, { headers });
    if (!response.ok) return R.makeError(response.status);
    const coAuthors = parseGithubCoAuthors(await response.json());
    const people = await Promise.all(
      A.map(coAuthors, (coAuthor) => confirmPerson(coAuthor, headers)),
    );
    return R.makeOk(A.filterMap(people, F.identity));
  } catch {
    return R.makeError(0);
  }
}
