/**
 * Minimal shape the paginator needs. Decoupled from `ResumeBlock` so this stays
 * a pure, testable packing function over ids, gaps, and grouping flags.
 */
export interface Paginable {
  id: string;
  gapBefore: number;
  keepWithNext: boolean;
}

/**
 * Height a group of blocks occupies. When placed first on a page the leading
 * block contributes no top gap (a page's top edge already provides the margin).
 */
function measureGroup<T extends Paginable>(
  group: T[],
  heights: Record<string, number>,
  isFirstOnPage: boolean,
): number {
  return group.reduce((total, block, index) => {
    const leadingGap = isFirstOnPage && index === 0 ? 0 : block.gapBefore;
    return total + leadingGap + (heights[block.id] ?? 0);
  }, 0);
}

/**
 * Greedily packs blocks into fixed-height pages. Blocks joined by `keepWithNext`
 * are treated as one indivisible group. A group that does not fit on the current
 * page starts a new one; a group taller than a whole page is placed anyway (this
 * variant does not split a single entry across pages) and clipped by the frame.
 */
export function paginate<T extends Paginable>(
  blocks: T[],
  heights: Record<string, number>,
  budget: number,
): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let used = 0;

  let index = 0;
  while (index < blocks.length) {
    const group: T[] = [blocks[index]];
    while (
      group[group.length - 1].keepWithNext &&
      index + group.length < blocks.length
    ) {
      group.push(blocks[index + group.length]);
    }

    const appendHeight = measureGroup(group, heights, false);
    if (current.length > 0 && used + appendHeight > budget) {
      pages.push(current);
      current = [];
      used = 0;
    }

    used += measureGroup(group, heights, current.length === 0);
    current.push(...group);
    index += group.length;
  }

  if (current.length > 0) pages.push(current);
  return pages;
}
