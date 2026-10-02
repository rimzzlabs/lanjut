import { A, O, pipe } from "@mobily/ts-belt";

/**
 * Minimal shape the paginator needs. Decoupled from `ResumeBlock` so this stays
 * a pure, testable packing function over ids, gaps, and grouping flags.
 */
export interface Paginable {
  id: string;
  gapBefore: number;
  keepWithNext: boolean;
}

interface MeasureGroupParams<T extends Paginable> {
  group: ReadonlyArray<T>;
  heights: Record<string, number>;
  isFirstOnPage: boolean;
}

/**
 * Height a group of blocks occupies. When placed first on a page the leading
 * block contributes no top gap (a page's top edge already provides the margin).
 */
function measureGroup<T extends Paginable>(
  params: MeasureGroupParams<T>,
): number {
  const { group, heights, isFirstOnPage } = params;
  return A.reduceWithIndex(group, 0, (total, block, index) => {
    const leadingGap = isFirstOnPage && index === 0 ? 0 : block.gapBefore;
    return total + leadingGap + (heights[block.id] ?? 0);
  });
}

/** Splits blocks into groups that end at the first block not kept with the next. */
function groupBlocks<T extends Paginable>(
  blocks: ReadonlyArray<T>,
): ReadonlyArray<ReadonlyArray<T>> {
  const none: ReadonlyArray<ReadonlyArray<T>> = [];
  return A.reduce(blocks, none, (groups, block) => {
    const open = pipe(
      A.last(groups),
      O.filter((group) =>
        O.mapWithDefault(A.last(group), false, (last) => last.keepWithNext),
      ),
    );
    if (O.isNone(open)) return A.append(groups, [block]);
    return A.replaceAt(groups, A.length(groups) - 1, A.append(open, block));
  });
}

interface Packing<T> {
  pages: ReadonlyArray<ReadonlyArray<T>>;
  current: ReadonlyArray<T>;
  used: number;
}

interface PaginateParams<T extends Paginable> {
  blocks: ReadonlyArray<T>;
  heights: Record<string, number>;
  budget: number;
}

/**
 * Greedily packs blocks into fixed-height pages. Blocks joined by `keepWithNext`
 * are treated as one indivisible group. A group that does not fit on the current
 * page starts a new one; a group taller than a whole page is placed anyway (this
 * variant does not split a single entry across pages) and clipped by the frame.
 */
export function paginate<T extends Paginable>(
  params: PaginateParams<T>,
): ReadonlyArray<ReadonlyArray<T>> {
  const { blocks, heights, budget } = params;
  const start: Packing<T> = { pages: [], current: [], used: 0 };
  const packed = A.reduce(groupBlocks(blocks), start, (state, group) => {
    const appendHeight = measureGroup({ group, heights, isFirstOnPage: false });
    if (A.isNotEmpty(state.current) && state.used + appendHeight > budget) {
      return {
        pages: A.append(state.pages, state.current),
        current: group,
        used: measureGroup({ group, heights, isFirstOnPage: true }),
      };
    }
    return {
      pages: state.pages,
      current: A.concat(state.current, group),
      used:
        state.used +
        measureGroup({
          group,
          heights,
          isFirstOnPage: A.isEmpty(state.current),
        }),
    };
  });

  if (A.isEmpty(packed.current)) return packed.pages;
  return A.append(packed.pages, packed.current);
}
