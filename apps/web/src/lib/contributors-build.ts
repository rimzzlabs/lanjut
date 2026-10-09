import { GITHUB_TOKEN } from "astro:env/server";
import { R } from "@mobily/ts-belt";
import { IS_DESKTOP } from "./build-target";
import { type Contributor, fetchGithubContributors } from "./contributors";

const NONE: ReadonlyArray<Contributor> = [];

// One request per build, shared by every page that shows the list. A failure
// is not kept, so the next page, or the next request in dev, asks again.
let atBuild: Promise<ReadonlyArray<Contributor>> | undefined;

/**
 * The contributors as of the build, for the static HTML that crawlers read.
 * A failed request gives an empty list, and the browser loads the list instead.
 */
export function contributorsAtBuild(): Promise<ReadonlyArray<Contributor>> {
  if (IS_DESKTOP) return Promise.resolve(NONE);
  atBuild ??= fetchGithubContributors(GITHUB_TOKEN, "lanjut-build").then(
    (result) =>
      R.match(
        result,
        (contributors) => contributors,
        () => {
          atBuild = undefined;
          return NONE;
        },
      ),
  );
  return atBuild;
}
