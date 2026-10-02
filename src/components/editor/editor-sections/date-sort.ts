import { A, O } from "@mobily/ts-belt";
import { byRecency, type Dated } from "../resume-sort";

/**
 * Assumes the rest of `items` is already sorted, so moving the one edited row at
 * `from` suffices. Returns its destination index when a move happened, else null.
 */
export function repositionByRecency<T extends Dated>(
  from: number,
  items: ReadonlyArray<T>,
  move: (from: number, to: number) => void,
): number | null {
  const moving = A.get(items, from);
  if (O.isNone(moving)) return null;

  const to = A.reduceWithIndex(items, 0, (count, item, index) =>
    index !== from && byRecency(item, moving) < 0 ? count + 1 : count,
  );

  if (to === from) return null;
  move(from, to);
  return to;
}
