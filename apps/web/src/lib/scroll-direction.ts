export type ScrollDirection = "up" | "down";

export interface ScrollChange {
  scroll: number;
  direction: ScrollDirection;
}

const SCROLL_THRESHOLD_PX = 8;

/** The clamp keeps overscroll bounce from reading as a direction change. */
function currentScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(window.scrollY, 0), maxScroll);
}

/**
 * The first scroll frame takes the starting position. A read when the script
 * starts would force a layout of the whole page before its first paint.
 */
export function onScrollDirection(callback: (change: ScrollChange) => void) {
  let lastScroll: number | undefined;
  let frame = 0;

  function update() {
    frame = 0;
    const scroll = currentScroll();
    const delta = scroll - (lastScroll ?? scroll);
    lastScroll ??= scroll;
    if (scroll > 0 && Math.abs(delta) < SCROLL_THRESHOLD_PX) return;
    lastScroll = scroll;
    callback({ scroll, direction: delta > 0 ? "down" : "up" });
  }

  function handleScroll() {
    if (frame === 0) frame = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", handleScroll);
    cancelAnimationFrame(frame);
  };
}
