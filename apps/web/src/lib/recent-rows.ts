/** The most résumés the Recent list of the sidebar shows. "View all" follows when there are more. */
export const RECENT_LIMIT = 5;

const RECENT_ROWS_KEY = "lanjut:recent-rows";

/** The number of rows the Recent list shows for a number of résumés. */
export function recentRows(count: number): number {
  return Math.min(count, RECENT_LIMIT) + (count > RECENT_LIMIT ? 1 : 0);
}

/**
 * Saves the number of rows where the head script (src/scripts/preferences.js)
 * finds it on the next page load. globals.css then gives the loading states of
 * the sidebar and the library the shape they had.
 */
export function saveRecentRows(rows: number) {
  const value = String(rows);
  document.documentElement.dataset.recent = value;
  try {
    localStorage.setItem(RECENT_ROWS_KEY, value);
  } catch {
    // Storage can be blocked. The lists still work for this page.
  }
}
