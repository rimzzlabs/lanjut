/**
 * A4 page geometry. The millimetre values are the source of truth (A4 is a
 * physical paper size); pixel values are derived at the CSS reference 96dpi so
 * on-screen measurement and the eventual print/@page export share one geometry.
 */
const MM_TO_PX = 96 / 25.4;

function mmToPx(value: number): number {
  return Math.round(value * MM_TO_PX);
}

export const A4 = {
  widthMm: 210,
  heightMm: 297,
  /** Inner page margin. Resume-typical; a preset once the presentation layer lands. */
  marginMm: 14,
  widthPx: mmToPx(210),
  heightPx: mmToPx(297),
  marginPx: mmToPx(14),
} as const;

/** Printable width of one page; the exact width content is measured at. */
export const CONTENT_WIDTH_PX = A4.widthPx - A4.marginPx * 2;

/** Printable height of one page; the per-page height budget for pagination. */
export const CONTENT_HEIGHT_PX = A4.heightPx - A4.marginPx * 2;
