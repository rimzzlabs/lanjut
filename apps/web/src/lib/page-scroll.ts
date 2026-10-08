/** The scroll region of the library and template pages, inside the app shell. */
export const PAGE_SCROLL_ID = "app-page-scroll";

/** The app pages scroll inside the shell, not the window. */
export function scrollPageToTop() {
  document
    .querySelector(`#${PAGE_SCROLL_ID} [data-slot="scroll-area-viewport"]`)
    ?.scrollTo({ top: 0, behavior: "instant" });
}
