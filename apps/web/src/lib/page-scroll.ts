/** The scroll region of the library and template pages, inside the app shell. */
export const PAGE_SCROLL_ID = "app-page-scroll";

/** The element that scrolls an app page. The window itself never scrolls. */
export function pageScrollViewport(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `#${PAGE_SCROLL_ID} [data-slot="scroll-area-viewport"]`,
  );
}

/** The app pages scroll inside the shell, not the window. */
export function scrollPageToTop() {
  pageScrollViewport()?.scrollTo({ top: 0, behavior: "instant" });
}
