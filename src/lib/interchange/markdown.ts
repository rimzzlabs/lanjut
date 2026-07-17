import type { JSONContent } from "@tiptap/core";
import { emptyRichTextValue } from "@/lib/resume";
import {
  type InlineRun,
  type RichBlock,
  tiptapToRichBlocks,
} from "@/lib/resume/rich-content";

/**
 * The interchange markdown dialect: exactly the restricted rich-text schema
 * (bold, italic, bullet/ordered list, link) and nothing else. The serializer
 * escapes every character the parser assigns meaning to, so a round trip never
 * mutates content; anything outside the dialect parses as literal text.
 */

function escapeText(text: string): string {
  return text.replace(/[\\*[\]]/g, (ch) => `\\${ch}`);
}

function escapeUrl(url: string): string {
  return url.replace(/[\\)]/g, (ch) => `\\${ch}`);
}

function runToMarkdown(run: InlineRun): string {
  // Emphasis markers must hug non-whitespace, so a run's edge whitespace is
  // shifted outside the markers ("bold " -> "**bold** ").
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(run.text);
  const [, lead = "", core = "", tail = ""] = match ?? [];
  if (!core) return run.text;
  let text = escapeText(core);
  if (run.italic) text = `*${text}*`;
  if (run.bold) text = `**${text}**`;
  if (run.href) text = `[${text}](${escapeUrl(run.href)})`;
  return lead + text + tail;
}

/** A paragraph line that would re-parse as a list item gets its marker escaped. */
function guardLineStart(line: string): string {
  const bullet = /^(\s*)-(\s)/.exec(line);
  if (bullet) {
    return `${bullet[1]}\\-${bullet[2]}${line.slice(bullet[0].length)}`;
  }
  const ordered = /^(\s*\d+)([.)])(\s)/.exec(line);
  if (ordered) {
    return `${ordered[1]}\\${ordered[2]}${line.slice(ordered[1].length + 1)}`;
  }
  return line;
}

export function richBlocksToInterchangeMarkdown(blocks: RichBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") {
      parts.push(guardLineStart(block.runs.map(runToMarkdown).join("").trim()));
      continue;
    }
    const lines = block.items.map((item, index) => {
      const marker = block.ordered ? `${index + 1}.` : "-";
      return `${marker} ${item.map(runToMarkdown).join("").trim()}`;
    });
    parts.push(lines.join("\n"));
  }
  return parts.join("\n\n");
}

export function tiptapToMarkdown(doc: JSONContent | undefined): string {
  return richBlocksToInterchangeMarkdown(tiptapToRichBlocks(doc));
}

// --- parsing ---------------------------------------------------------------

interface InlineMarks {
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

/** Any ASCII punctuation may be backslash-escaped (CommonMark's rule). */
const ESCAPABLE = /[!-/:-@[-`{-~]/;

function unescapeText(text: string): string {
  return text.replace(/\\([!-/:-@[-`{-~])/g, "$1");
}

/** The first unescaped occurrence of `delim` at or after `from`, or -1. */
function findDelimiter(src: string, delim: string, from: number): number {
  for (let i = from; i <= src.length - delim.length; i += 1) {
    if (src[i] === "\\") {
      i += 1;
      continue;
    }
    if (src.startsWith(delim, i)) return i;
  }
  return -1;
}

function appendRun(out: InlineRun[], text: string, marks: InlineMarks): void {
  if (!text) return;
  const last = out[out.length - 1];
  if (
    last &&
    Boolean(last.bold) === Boolean(marks.bold) &&
    Boolean(last.italic) === Boolean(marks.italic) &&
    last.href === marks.href
  ) {
    last.text += text;
    return;
  }
  const run: InlineRun = { text };
  if (marks.bold) run.bold = true;
  if (marks.italic) run.italic = true;
  if (marks.href) run.href = marks.href;
  out.push(run);
}

function parseSegment(src: string, marks: InlineMarks, out: InlineRun[]): void {
  let buffer = "";
  let i = 0;
  const flush = () => {
    appendRun(out, buffer, marks);
    buffer = "";
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\" && i + 1 < src.length && ESCAPABLE.test(src[i + 1])) {
      buffer += src[i + 1];
      i += 2;
      continue;
    }
    if (ch === "*") {
      // Longest marker first, so `***x***` reads as bold+italic rather than a
      // dangling `*` inside bold.
      const triple = src.startsWith("***", i)
        ? findDelimiter(src, "***", i + 3)
        : -1;
      if (triple !== -1) {
        flush();
        const inner = src.slice(i + 3, triple);
        parseSegment(inner, { ...marks, bold: true, italic: true }, out);
        i = triple + 3;
        continue;
      }
      const double = src.startsWith("**", i)
        ? findDelimiter(src, "**", i + 2)
        : -1;
      if (double !== -1) {
        flush();
        parseSegment(src.slice(i + 2, double), { ...marks, bold: true }, out);
        i = double + 2;
        continue;
      }
      const single = findDelimiter(src, "*", i + 1);
      if (single !== -1) {
        flush();
        parseSegment(src.slice(i + 1, single), { ...marks, italic: true }, out);
        i = single + 1;
        continue;
      }
      buffer += ch;
      i += 1;
      continue;
    }
    if (ch === "[") {
      const close = findDelimiter(src, "]", i + 1);
      const paren =
        close !== -1 && src[close + 1] === "("
          ? findDelimiter(src, ")", close + 2)
          : -1;
      if (close !== -1 && paren !== -1) {
        flush();
        const href = unescapeText(src.slice(close + 2, paren));
        parseSegment(src.slice(i + 1, close), { ...marks, href }, out);
        i = paren + 1;
        continue;
      }
      buffer += ch;
      i += 1;
      continue;
    }
    buffer += ch;
    i += 1;
  }
  flush();
}

export function parseInlineMarkdown(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  parseSegment(text, {}, runs);
  return runs;
}

const BULLET_LINE = /^\s*[-*]\s+/;
const ORDERED_LINE = /^\s*\d+[.)]\s+/;

export function markdownToRichBlocks(text: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  let list: { ordered: boolean; items: InlineRun[][] } | null = null;
  const flushList = () => {
    if (list && list.items.length > 0) {
      blocks.push({ type: "list", ordered: list.ordered, items: list.items });
    }
    list = null;
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    const marker = BULLET_LINE.exec(line) ?? ORDERED_LINE.exec(line);
    if (marker) {
      const ordered = ORDERED_LINE.test(line);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      const runs = parseInlineMarkdown(line.slice(marker[0].length).trim());
      if (runs.length > 0) list.items.push(runs);
      continue;
    }
    flushList();
    const runs = parseInlineMarkdown(line);
    if (runs.length > 0) blocks.push({ type: "paragraph", runs });
  }
  flushList();
  return blocks;
}

// --- building TipTap documents ---------------------------------------------

function textNode(run: InlineRun): JSONContent {
  const marks: NonNullable<JSONContent["marks"]> = [];
  if (run.bold) marks.push({ type: "bold" });
  if (run.italic) marks.push({ type: "italic" });
  if (run.href) marks.push({ type: "link", attrs: { href: run.href } });
  const node: JSONContent = { type: "text", text: run.text };
  if (marks.length > 0) node.marks = marks;
  return node;
}

function paragraphNode(runs: InlineRun[]): JSONContent {
  return { type: "paragraph", content: runs.map(textNode) };
}

export function richBlocksToTiptap(blocks: RichBlock[]): JSONContent {
  if (blocks.length === 0) return emptyRichTextValue();
  const content = blocks.map(
    (block): JSONContent =>
      block.type === "paragraph"
        ? paragraphNode(block.runs)
        : {
            type: block.ordered ? "orderedList" : "bulletList",
            content: block.items.map((item) => ({
              type: "listItem",
              content: [paragraphNode(item)],
            })),
          },
  );
  return { type: "doc", content };
}

export function markdownToTiptap(text: string): JSONContent {
  return richBlocksToTiptap(markdownToRichBlocks(text));
}
