import {
  fromGithubSearch,
  SIMILAR_ISSUES_PATH,
  SIMILAR_MIN_LENGTH,
  similarIssuesQuery,
} from "../src/lib/feedback/similar-issues";
import { GITHUB_REPO } from "../src/lib/github-issue";

const GITHUB_SEARCH_URL = "https://api.github.com/search/issues";
const CACHE_SECONDS = 60 * 60;
const RESULTS = 5;

interface SimilarEnv {
  GITHUB_ISSUE_TOKEN?: string;
}

interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

// The Workers runtime adds a `default` cache to `caches`; the DOM typings the
// Worker is checked with do not know it, so it is named here.
const edgeCache = (caches as unknown as { default: Cache }).default;

function json(body: unknown, cacheControl: string) {
  return Response.json(body, { headers: { "Cache-Control": cacheControl } });
}

/**
 * Issues whose titles look like the one being written, so a reporter finds a
 * duplicate before filing it. Each query is cached at the edge for an hour,
 * which keeps the GitHub search quota for real typing.
 */
export async function serveSimilarIssues(
  request: Request,
  env: SimilarEnv,
  context: WaitUntil,
): Promise<Response> {
  const words = similarIssuesQuery(
    new URL(request.url).searchParams.get("q") ?? "",
  );
  if (words.length < SIMILAR_MIN_LENGTH) {
    return json({ issues: [] }, "no-store");
  }

  const key = new Request(
    new URL(
      `${SIMILAR_ISSUES_PATH}?q=${encodeURIComponent(words.toLowerCase())}`,
      request.url,
    ).href,
  );
  const cached = await edgeCache.match(key);
  if (cached) return cached;

  const search = new URL(GITHUB_SEARCH_URL);
  search.searchParams.set(
    "q",
    `${words} repo:${GITHUB_REPO} is:issue in:title`,
  );
  search.searchParams.set("per_page", String(RESULTS));
  const github = await fetch(search, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "lanjut-worker",
      ...(env.GITHUB_ISSUE_TOKEN && {
        Authorization: `Bearer ${env.GITHUB_ISSUE_TOKEN}`,
      }),
    },
  });
  if (!github.ok) return json({ issues: [] }, "no-store");

  const response = json(
    { issues: fromGithubSearch(await github.json()) },
    `public, max-age=${CACHE_SECONDS}`,
  );
  context.waitUntil(edgeCache.put(key, response.clone()));
  return response;
}
