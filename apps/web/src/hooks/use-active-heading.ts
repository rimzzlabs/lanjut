import { A, G, O, pipe } from "@mobily/ts-belt";
import { useEffect, useState } from "react";

// A heading becomes the active one once its top passes this line.
const ACTIVE_OFFSET_PX = 120;
const BOTTOM_TOLERANCE_PX = 2;

/** The slug of the heading the reader is in, following the window's scroll. */
export function useActiveHeading(slugs: ReadonlyArray<string>): string {
  const [active, setActive] = useState(O.getWithDefault(A.head(slugs), ""));

  useEffect(() => {
    const elements = pipe(
      slugs,
      A.map((slug) => document.getElementById(slug)),
      A.filter(G.isNotNullable),
    );
    if (A.isEmpty(elements)) return;

    function update() {
      const root = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >=
        root.scrollHeight - BOTTOM_TOLERANCE_PX;
      const passed = A.takeWhile(
        elements,
        (element) => element.getBoundingClientRect().top <= ACTIVE_OFFSET_PX,
      );
      const current = atBottom ? A.last(elements) : A.last(passed);
      const first = O.mapWithDefault(
        A.head(elements),
        "",
        (element) => element.id,
      );
      setActive(O.mapWithDefault(current, first, (element) => element.id));
    }

    // One update per frame, however many scroll events arrive.
    const frame = { id: 0 };
    function schedule() {
      if (frame.id !== 0) return;
      frame.id = requestAnimationFrame(() => {
        frame.id = 0;
        update();
      });
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame.id);
    };
  }, [slugs]);

  return active;
}
