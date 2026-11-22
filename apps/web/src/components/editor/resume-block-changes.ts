import type { Resume } from "@lanjut/resume";
import { A, D, O, pipe } from "@mobily/ts-belt";
import { buildResumeBlocks, type ResumeBlock } from "./resume-blocks";
import { resumeToPreview } from "./resume-to-preview";

// The gap and the page glue follow a block's place in its section, so an
// entry added above another one would mark the other one too.
function blockContent(block: ResumeBlock): string {
  return JSON.stringify(D.deleteKeys(block, ["gapBefore", "keepWithNext"]));
}

/**
 * The page blocks of `after` that `before` does not have as they are, in
 * reading order. A removed block has nothing left to mark, so it is not here.
 */
export function changedBlockIds(
  before: Resume,
  after: Resume,
): ReadonlyArray<string> {
  const previous = pipe(
    buildResumeBlocks(resumeToPreview(before)),
    A.map((block) => [block.id, blockContent(block)] as const),
    D.fromPairs,
  );
  return pipe(
    buildResumeBlocks(resumeToPreview(after)),
    A.filter((block) =>
      O.mapWithDefault(
        D.get(previous, block.id),
        true,
        (content) => content !== blockContent(block),
      ),
    ),
    A.map((block) => block.id),
  );
}
