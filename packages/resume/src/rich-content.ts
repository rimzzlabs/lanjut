import { A, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";

/**
 * A run of inline text carrying the restricted schema's marks (bold, italic,
 * link). This is the export-neutral shape every renderer consumes (the DOM
 * preview, the PDF template, and the text/docx serializers) so marks survive
 * into every output instead of collapsing to plain strings.
 */
export interface InlineRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

/**
 * A block in a rich field: a paragraph, or a bullet/ordered list whose items are
 * each a line of runs. The restricted TipTap schema has no nesting beyond this.
 */
export type RichBlock =
  | { type: "paragraph"; runs: ReadonlyArray<InlineRun> }
  | {
      type: "list";
      ordered: boolean;
      items: ReadonlyArray<ReadonlyArray<InlineRun>>;
    };

function markOf(
  mark: NonNullable<JSONContent["marks"]>[number],
): Partial<InlineRun> {
  if (mark.type === "bold") return { bold: true };
  if (mark.type === "italic") return { italic: true };
  if (mark.type === "link" && mark.attrs?.href) {
    return { href: String(mark.attrs.href) };
  }
  return {};
}

function runFromText(node: JSONContent): InlineRun {
  return A.reduce(
    node.marks ?? [],
    { text: node.text ?? "" } as InlineRun,
    (run, mark) => ({ ...run, ...markOf(mark) }),
  );
}

/** Depth-first collection of every text node under `node`, in document order. */
function collectRuns(node: JSONContent): ReadonlyArray<InlineRun> {
  if (node.type !== "text") return A.flatMap(node.content ?? [], collectRuns);
  if (!node.text) return [];
  return [runFromText(node)];
}

function nodeToRichBlock(node: JSONContent): O.Option<RichBlock> {
  if (node.type === "bulletList" || node.type === "orderedList") {
    const items = pipe(
      node.content ?? [],
      A.map(collectRuns),
      A.filter(A.isNotEmpty),
    );
    if (A.isEmpty(items)) return O.None;
    return {
      type: "list",
      ordered: node.type === "orderedList",
      items,
    };
  }
  const runs = collectRuns(node);
  if (A.isEmpty(runs)) return O.None;
  return { type: "paragraph", runs };
}

/**
 * Projects a restricted TipTap document into linear `RichBlock`s. Empty
 * paragraphs and empty list items are dropped so an untouched editor yields `[]`.
 */
export function tiptapToRichBlocks(
  doc: JSONContent | undefined,
): ReadonlyArray<RichBlock> {
  return A.filterMap(doc?.content ?? [], nodeToRichBlock);
}

function runsHaveText(runs: ReadonlyArray<InlineRun>): boolean {
  return A.some(runs, (run) => S.isNotEmpty(S.trim(run.text)));
}

function blockHasText(block: RichBlock): boolean {
  if (block.type === "paragraph") return runsHaveText(block.runs);
  return A.some(block.items, runsHaveText);
}

/** True when the blocks hold no non-whitespace text (used to gate empty fields). */
export function isRichEmpty(blocks: ReadonlyArray<RichBlock>): boolean {
  return !A.some(blocks, blockHasText);
}

function runsText(runs: ReadonlyArray<InlineRun>): string {
  return pipe(
    runs,
    A.map((run) => run.text),
    A.join(""),
    S.trim,
  );
}

function runMarkdown(run: InlineRun): string {
  // GFM emphasis markers must hug non-whitespace, so a run's edge whitespace
  // is shifted outside the markers ("bold " -> "**bold** ").
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(run.text);
  const [, lead = "", core = "", tail = ""] = match ?? [];
  if (!core) return run.text;
  let text = core;
  if (run.italic) text = `*${text}*`;
  if (run.bold) text = `**${text}**`;
  if (run.href) text = `[${text}](${run.href})`;
  return lead + text + tail;
}

function blockToMarkdown(block: RichBlock): string {
  if (block.type === "paragraph") {
    return pipe(block.runs, A.map(runMarkdown), A.join(""), S.trim);
  }
  const lines = A.mapWithIndex(block.items, (index, item) => {
    const marker = block.ordered ? `${index + 1}.` : "-";
    return `${marker} ${pipe(item, A.map(runMarkdown), A.join(""), S.trim)}`;
  });
  return A.join(lines, "\n");
}

/**
 * Serializes rich blocks to GitHub-flavored markdown (used to prefill issue
 * bodies, which GitHub renders as markdown). Paragraphs become blocks separated
 * by blank lines; lists keep their `-` / `1.` markers.
 */
export function richBlocksToMarkdown(blocks: ReadonlyArray<RichBlock>): string {
  return pipe(blocks, A.map(blockToMarkdown), A.join("\n\n"));
}

function blockToTextLines(block: RichBlock): ReadonlyArray<string> {
  if (block.type === "paragraph") {
    const text = runsText(block.runs);
    if (S.isEmpty(text)) return [];
    return [text];
  }
  return pipe(
    block.items,
    A.map(runsText),
    A.filter(S.isNotEmpty),
    A.map((text) => `- ${text}`),
  );
}

/**
 * Flattens rich blocks to plain-text lines (one per paragraph, and each list
 * item prefixed with "- ") for the .txt export. Marks are dropped (plain text
 * carries no formatting); reading order is preserved.
 */
export function richBlocksToText(
  blocks: ReadonlyArray<RichBlock>,
): ReadonlyArray<string> {
  return A.flatMap(blocks, blockToTextLines);
}
