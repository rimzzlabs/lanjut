import { GITHUB_TOKEN } from "astro:env/server";
import { O, R } from "@mobily/ts-belt";
import { IS_DESKTOP } from "./build-target";
import { fetchGithubStars } from "./github-stars";

// One request per build, shared by every page that shows the count. A failure
// is not kept, so the next page, or the next request in dev, asks again.
let atBuild: Promise<O.Option<number>> | undefined;

/**
 * The star count as of the build, for the landing navbar. It is never fetched
 * in the browser, so the count is as fresh as the last deploy. A failed
 * request gives none, and the navbar shows the GitHub icon alone.
 */
export function starsAtBuild(): Promise<O.Option<number>> {
  if (IS_DESKTOP) return Promise.resolve(O.None);
  atBuild ??= fetchGithubStars(GITHUB_TOKEN, "lanjut-build").then((result) =>
    R.match(
      result,
      (stars) => O.Some(stars),
      () => {
        atBuild = undefined;
        return O.None;
      },
    ),
  );
  return atBuild;
}
