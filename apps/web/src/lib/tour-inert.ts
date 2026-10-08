import { A, pipe } from "@mobily/ts-belt";

const TOUR_OVERLAY = '[data-name="nextstep-overlay"]';
const MARK = "data-tour-inert";

function markOutsideTour() {
  pipe(
    Array.from(document.body.children),
    A.reject(
      (child) => child.matches(TOUR_OVERLAY) || child.hasAttribute("inert"),
    ),
    A.forEach((child) => {
      child.setAttribute("inert", "");
      child.setAttribute(MARK, "");
    }),
  );
}

/**
 * Makes the page under a tour inert, by mouse and by keyboard. Sheets render
 * at the top of the body, outside the app, so every top-level element is
 * marked, and so is any sheet a step opens later. The cleanup lifts only what
 * it marked and gives focus back to where it was.
 */
export function inertOutsideTour(): () => void {
  const before = document.activeElement;
  markOutsideTour();
  const observer = new MutationObserver(markOutsideTour);
  observer.observe(document.body, { childList: true });

  return () => {
    observer.disconnect();
    pipe(
      Array.from(document.querySelectorAll(`[${MARK}]`)),
      A.forEach((element) => {
        element.removeAttribute("inert");
        element.removeAttribute(MARK);
      }),
    );
    if (before instanceof HTMLElement && before.isConnected) {
      before.focus({ preventScroll: true });
    }
  };
}
