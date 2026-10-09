import { R } from "@mobily/ts-belt";
import {
  CONTRIBUTORS_PATH,
  fetchGithubContributors,
  secondsUntilUtcMidnight,
} from "../src/lib/contributors";

interface ContributorsEnv {
  GITHUB_ISSUE_TOKEN?: string;
}

interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

// The Workers runtime adds a `default` cache to `caches`; the DOM typings the
// Worker is checked with do not know it, so it is named here.
const edgeCache = (caches as unknown as { default: Cache }).default;

/**
 * The repository's contributors, cached at the edge until the next 00:00 UTC
 * so GitHub is asked once a day. The token that files feedback also lifts the
 * GitHub rate limit here; without it the request goes out unauthenticated.
 * The list is public, so any origin may read it.
 */
export async function serveContributors(
  request: Request,
  env: ContributorsEnv,
  context: WaitUntil,
): Promise<Response> {
  const key = new Request(new URL(CONTRIBUTORS_PATH, request.url).href);
  const cached = await edgeCache.match(key);
  if (cached) return cached;

  const github = await fetchGithubContributors(
    env.GITHUB_ISSUE_TOKEN,
    "lanjut-worker",
  );
  return R.match(
    github,
    (contributors) => {
      const response = Response.json(
        { contributors },
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": `public, max-age=${secondsUntilUtcMidnight(new Date())}`,
          },
        },
      );
      context.waitUntil(edgeCache.put(key, response.clone()));
      return response;
    },
    () =>
      Response.json(
        { error: "GitHub did not answer." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      ),
  );
}
