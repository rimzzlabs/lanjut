import { R } from "@mobily/ts-belt";
import { fetchGithubStars, STARS_PATH } from "../src/lib/github-stars";

const CACHE_SECONDS = 60 * 60;

interface StarsEnv {
  GITHUB_ISSUE_TOKEN?: string;
}

interface WaitUntil {
  waitUntil(promise: Promise<unknown>): void;
}

// The Workers runtime adds a `default` cache to `caches`; the DOM typings the
// Worker is checked with do not know it, so it is named here.
const edgeCache = (caches as unknown as { default: Cache }).default;

/**
 * The repository's star count, cached at the edge for an hour. The pages
 * carry the count of their build, and refresh it from here.
 */
export async function serveStars(
  request: Request,
  env: StarsEnv,
  context: WaitUntil,
): Promise<Response> {
  const key = new Request(new URL(STARS_PATH, request.url).href);
  const cached = await edgeCache.match(key);
  if (cached) return cached;

  const github = await fetchGithubStars(
    env.GITHUB_ISSUE_TOKEN,
    "lanjut-worker",
  );
  return R.match(
    github,
    (stars) => {
      const response = Response.json(
        { stars },
        { headers: { "Cache-Control": `public, max-age=${CACHE_SECONDS}` } },
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
