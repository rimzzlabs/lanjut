import type { JSONContent } from "@tiptap/core";

/**
 * A run of inline text carrying the restricted schema's marks (bold, italic,
 * link). This is the export-neutral shape every renderer consumes — the DOM
 * preview, the PDF template, and the text/docx serializers — so marks survive
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
  | { type: "paragraph"; runs: InlineRun[] }
  | { type: "list"; ordered: boolean; items: InlineRun[][] };

function runFromText(node: JSONContent): InlineRun {
  const run: InlineRun = { text: node.text ?? "" };
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") run.bold = true;
    else if (mark.type === "italic") run.italic = true;
    else if (mark.type === "link" && mark.attrs?.href) {
      run.href = String(mark.attrs.href);
    }
  }
  return run;
}

/** Depth-first collection of every text node under `node`, in document order. */
function collectRuns(node: JSONContent): InlineRun[] {
  if (node.type === "text") return node.text ? [runFromText(node)] : [];
  const runs: InlineRun[] = [];
  for (const child of node.content ?? []) runs.push(...collectRuns(child));
  return runs;
}

/**
 * Projects a restricted TipTap document into linear `RichBlock`s. Empty
 * paragraphs and empty list items are dropped so an untouched editor yields `[]`.
 */
export function tiptapToRichBlocks(doc: JSONContent | undefined): RichBlock[] {
  const blocks: RichBlock[] = [];
  for (const node of doc?.content ?? []) {
    if (node.type === "bulletList" || node.type === "orderedList") {
      const items: InlineRun[][] = [];
      for (const item of node.content ?? []) {
        const runs = collectRuns(item);
        if (runs.length > 0) items.push(runs);
      }
      if (items.length > 0) {
        blocks.push({
          type: "list",
          ordered: node.type === "orderedList",
          items,
        });
      }
      continue;
    }
    const runs = collectRuns(node);
    if (runs.length > 0) blocks.push({ type: "paragraph", runs });
  }
  return blocks;
}

/** True when the blocks hold no non-whitespace text (used to gate empty fields). */
export function isRichEmpty(blocks: RichBlock[]): boolean {
  const hasText = (runs: InlineRun[]) => runs.some((run) => run.text.trim());
  return !blocks.some((block) =>
    block.type === "paragraph"
      ? hasText(block.runs)
      : block.items.some(hasText),
  );
}

function runsText(runs: InlineRun[]): string {
  return runs
    .map((run) => run.text)
    .join("")
    .trim();
}

/**
 * Flattens rich blocks to plain-text lines — one per paragraph, and each list
 * item prefixed with "- " — for the .txt export. Marks are dropped (plain text
 * carries no formatting); reading order is preserved.
 */
export function richBlocksToText(blocks: RichBlock[]): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      const text = runsText(block.runs);
      if (text) lines.push(text);
      continue;
    }
    for (const item of block.items) {
      const text = runsText(item);
      if (text) lines.push(`- ${text}`);
    }
  }
  return lines;
}
