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

/**
 * The repository's contributors, from the Worker's daily copy. The desktop
 * app makes no request: it has no Worker of its own, and it makes no network
 * call the person did not ask for. A failed request leaves the list out; the
 * invitation to contribute still shows. Fetching is an external-system effect.
 */
export function useContributors(): ContributorsState {
  const [state, setState] = useState<ContributorsState>(() =>
    IS_DESKTOP ? { status: "unavailable" } : { status: "loading" },
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
        if (!cancelled) setState({ status: "unavailable" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
