import { O } from "@mobily/ts-belt";
import { useEffect, useState } from "react";
import { loadStars } from "@/lib/github-stars-live";

/**
 * The repository's star count: the count of the build at once, then the
 * Worker's hourly copy. The first stays if the refresh fails. Fetching is an
 * external-system effect.
 */
export function useGithubStars(initial: number | undefined) {
  const [stars, setStars] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    loadStars().then((live) => {
      if (cancelled) return;
      O.match(live, setStars, () => undefined);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return stars;
}
