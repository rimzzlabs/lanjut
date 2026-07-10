import { byRecency } from "../resume-sort";

type Dated = { startDate: string; endDate: string };

/**
 * Assumes the rest of `items` is already sorted, so moving the one edited row at
 * `from` suffices. Returns its destination index when a move happened, else null.
 */
export function repositionByRecency<T extends Dated>(
  from: number,
  items: T[],
  move: (from: number, to: number) => void,
): number | null {
  if (from < 0 || from >= items.length) return null;

  const moving = items[from];
  let to = 0;
  for (let i = 0; i < items.length; i++) {
    if (i !== from && byRecency(items[i], moving) < 0) to++;
  }

  if (to === from) return null;
  move(from, to);
  return to;
}
