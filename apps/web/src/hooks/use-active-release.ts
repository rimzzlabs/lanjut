import { A, O, pipe } from "@mobily/ts-belt";
import { useEffect, useState } from "react";
import { pageScrollViewport } from "@/lib/page-scroll";

// A release counts as being read once its top passes this line, measured from
// the top of the page's scroll region.
const READ_LINE_PX = 96;

/**
 * The fragment id of the release being read on the changelog page: the last
 * one whose top has passed the read line. At the very bottom of the page, the
 * last release, which may be too short to reach the line.
 */
export function useActiveRelease(anchors: ReadonlyArray<string>): string {
  const first = O.getWithDefault(A.head(anchors), "");
  const [active, setActive] = useState(first);

  useEffect(() => {
    const viewport = pageScrollViewport();
    if (!viewport) return;
    const scroller = viewport;

    function read() {
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if (atBottom && scroller.scrollTop > 0) {
        setActive(O.getWithDefault(A.last(anchors), first));
        return;
      }
      const line = scroller.getBoundingClientRect().top + READ_LINE_PX;
      const passed = pipe(
        anchors,
        A.filter((anchor) => {
          const top = document
            .getElementById(anchor)
            ?.getBoundingClientRect().top;
          return top !== undefined && top <= line;
        }),
        A.last,
      );
      setActive(O.getWithDefault(passed, first));
    }

    read();
    scroller.addEventListener("scroll", read, { passive: true });
    return () => scroller.removeEventListener("scroll", read);
  }, [anchors, first]);

  return active;
}
