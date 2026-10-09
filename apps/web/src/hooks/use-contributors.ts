import { A } from "@mobily/ts-belt";
import { useEffect, useState } from "react";
import { IS_DESKTOP } from "@/lib/build-target";
import {
  CONTRIBUTORS_PATH,
  type Contributor,
  parseContributors,
} from "@/lib/contributors";

export type ContributorsState =
  | { status: "loading" }
  | { status: "ready"; contributors: ReadonlyArray<Contributor> }
  | { status: "unavailable" };

// One request per page load, shared by the library and its loading state.
let request: Promise<ReadonlyArray<Contributor>> | null = null;

function loadContributors(): Promise<ReadonlyArray<Contributor>> {
  request ??= fetch(CONTRIBUTORS_PATH)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(parseContributors);
  return request;
}

function initialState(initial: ReadonlyArray<Contributor>): ContributorsState {
  if (IS_DESKTOP) return { status: "unavailable" };
  if (!A.isEmpty(initial)) return { status: "ready", contributors: initial };
  return { status: "loading" };
}

/**
 * The repository's contributors, from the Worker's daily copy. A page that
 * rendered a list at build time passes it as `initial`: it shows at once and
 * stays if the refresh fails. The desktop app makes no request: it has no
 * Worker of its own, and it makes no network call the person did not ask for.
 * Without any list, the invitation to contribute still shows. Fetching is an
 * external-system effect.
 */
export function useContributors(
  initial: ReadonlyArray<Contributor> = [],
): ContributorsState {
  const [state, setState] = useState<ContributorsState>(() =>
    initialState(initial),
  );

  useEffect(() => {
    if (IS_DESKTOP) return;
    let cancelled = false;
    loadContributors().then(
      (contributors) => {
        if (!cancelled) setState({ status: "ready", contributors });
      },
      () => {
        request = null;
        if (cancelled) return;
        setState((current) =>
          current.status === "ready" ? current : { status: "unavailable" },
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
