import { useEffect, useState } from "react";

export const MEDIA_XL = "(min-width: 80rem)";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const read = () => setMatches(mql.matches);
    mql.addEventListener("change", read);
    // See use-mobile: a hidden window measures wrong and revealing it does not
    // always fire a change event.
    document.addEventListener("visibilitychange", read);
    read();
    return () => {
      mql.removeEventListener("change", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, [query]);

  return matches;
}
