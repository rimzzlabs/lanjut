import { useCallback, useSyncExternalStore } from "react";

export const MEDIA_XL = "(min-width: 80rem)";

function serverMatches(): boolean | undefined {
  return undefined;
}

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      // See use-mobile: a hidden window measures wrong and revealing it does not
      // always fire a change event.
      document.addEventListener("visibilitychange", onChange);
      return () => {
        mql.removeEventListener("change", onChange);
        document.removeEventListener("visibilitychange", onChange);
      };
    },
    [query],
  );
  const read = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore<boolean | undefined>(
    subscribe,
    read,
    serverMatches,
  );
}
