import { dateSortValue } from "./month-year-menu/month-year-menu-data";

type Dated = { startDate: string; endDate: string };

/** `a === b` first guards against `Infinity - Infinity` (NaN) for ongoing dates. */
function compareDesc(a: number, b: number): number {
  return a === b ? 0 : b - a;
}

/**
 * Orders dated entries newest-first: end date descending, then start date. An
 * ongoing ("Present") or undated entry ranks as the most recent, so a just-added
 * row surfaces at the top until the user dates it. Shared by the preview
 * projection and the editor forms so both present entries in the same order.
 */
export function byRecency(a: Dated, b: Dated): number {
  const end = compareDesc(dateSortValue(a.endDate), dateSortValue(b.endDate));
  if (end !== 0) return end;
  return compareDesc(dateSortValue(a.startDate), dateSortValue(b.startDate));
}
