import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const read = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", read);
    // A window that is still hidden reports no usable width, and revealing it
    // does not always fire a media query change. Re-read when the document
    // comes on screen, or the first measurement stands for the whole session.
    document.addEventListener("visibilitychange", read);
    read();
    return () => {
      mql.removeEventListener("change", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);

  return !!isMobile;
}
