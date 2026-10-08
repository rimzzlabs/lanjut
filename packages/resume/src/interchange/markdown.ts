import { A, F, G, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { emptyRichTextValue } from "..";
import {
  type InlineRun,
  type RichBlock,
  tiptapToRichBlocks,
} from "../rich-content";

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
    return `${bullet[1]}\\-${bullet[2]}${S.sliceToEnd(line, S.length(bullet[0]))}`;
  }
  const ordered = /^(\s*\d+)([.)])(\s)/.exec(line);
  if (ordered) {
    return `${ordered[1]}\\${ordered[2]}${S.sliceToEnd(line, S.length(ordered[1]) + 1)}`;
  }
  return line;
}

function blockToInterchangeMarkdown(block: RichBlock): string {
  if (block.type === "paragraph") {
    return guardLineStart(
      pipe(block.runs, A.map(runToMarkdown), A.join(""), S.trim),
    );
  }
  const lines = A.mapWithIndex(block.items, (index, item) => {
    const marker = block.ordered ? `${index + 1}.` : "-";
    return `${marker} ${pipe(item, A.map(runToMarkdown), A.join(""), S.trim)}`;
  });
  return A.join(lines, "\n");
}

export function richBlocksToInterchangeMarkdown(
  blocks: ReadonlyArray<RichBlock>,
): string {
  return pipe(blocks, A.map(blockToInterchangeMarkdown), A.join("\n\n"));
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
  return S.replaceByRe(text, /\\([!-/:-@[-`{-~])/g, "$1");
}

interface FindDelimiterParams {
  src: string;
  delim: string;
  from: number;
}

/** The first unescaped occurrence of `delim` at or after `from`, or -1. */
function findDelimiter(params: FindDelimiterParams): number {
  const { src, delim, from } = params;
  for (let i = from; i <= S.length(src) - S.length(delim); i += 1) {
    if (S.get(src, i) === "\\") {
      i += 1;
      continue;
    }
    if (src.startsWith(delim, i)) return i;
  }
  return -1;
}

/** A run of text with the marks of the segment it was read from. */
interface Piece {
  text: string;
  marks: InlineMarks;
}

function sameMarks(run: InlineRun, marks: InlineMarks): boolean {
  return (
    Boolean(run.bold) === Boolean(marks.bold) &&
    Boolean(run.italic) === Boolean(marks.italic) &&
    run.href === marks.href
  );
}

function runFromPiece(piece: Piece): InlineRun {
  const { text, marks } = piece;
  return {
    text,
    ...(Boolean(marks.bold) && { bold: true }),
    ...(Boolean(marks.italic) && { italic: true }),
    ...(Boolean(marks.href) && { href: marks.href }),
  };
}

/** Adds a piece, merging it into the last run when the marks match. */
function appendRun(
  runs: ReadonlyArray<InlineRun>,
  piece: Piece,
): ReadonlyArray<InlineRun> {
  if (!piece.text) return runs;
  const last = A.last(runs);
  if (O.isNone(last) || !sameMarks(last, piece.marks)) {
    return A.append(runs, runFromPiece(piece));
  }
  const merged = { ...last, text: last.text + piece.text };
  return A.replaceAt(runs, A.length(runs) - 1, merged);
}

interface DelimiterAfterParams {
  src: string;
  marker: string;
  at: number;
}

/** Where the closing `marker` ends, when `src` opens one at `at`, or -1. */
function delimiterAfter(params: DelimiterAfterParams): number {
  const { src, marker, at } = params;
  if (!src.startsWith(marker, at)) return -1;
  return findDelimiter({ src, delim: marker, from: at + S.length(marker) });
}

/** The `)` that closes a link target after the `]` at `close`, or -1. */
function linkTargetEnd(src: string, close: number): number {
  if (close === -1 || S.get(src, close + 1) !== "(") return -1;
  return findDelimiter({ src, delim: ")", from: close + 2 });
}

function parseSegment(src: string, marks: InlineMarks): ReadonlyArray<Piece> {
  let pieces: ReadonlyArray<Piece> = [];
  let buffer = "";
  let i = 0;
  const flush = () => {
    pieces = A.append(pieces, { text: buffer, marks });
    buffer = "";
  };
  const nest = (inner: string, innerMarks: InlineMarks) => {
    pieces = A.concat(pieces, parseSegment(inner, innerMarks));
  };
  while (i < S.length(src)) {
    const ch = O.getWithDefault(S.get(src, i), "");
    const next = S.get(src, i + 1);
    if (ch === "\\" && O.isSome(next) && ESCAPABLE.test(next)) {
      buffer += next;
      i += 2;
      continue;
    }
    if (ch === "*") {
      // Longest marker first, so `***x***` reads as bold+italic rather than a
      // dangling `*` inside bold.
      const triple = delimiterAfter({ src, marker: "***", at: i });
      if (triple !== -1) {
        flush();
        nest(S.slice(src, i + 3, triple), {
          ...marks,
          bold: true,
          italic: true,
        });
        i = triple + 3;
        continue;
      }
      const double = delimiterAfter({ src, marker: "**", at: i });
      if (double !== -1) {
        flush();
        nest(S.slice(src, i + 2, double), { ...marks, bold: true });
        i = double + 2;
        continue;
      }
      const single = findDelimiter({ src, delim: "*", from: i + 1 });
      if (single !== -1) {
        flush();
        nest(S.slice(src, i + 1, single), { ...marks, italic: true });
        i = single + 1;
        continue;
      }
      buffer += ch;
      i += 1;
      continue;
    }
    if (ch === "[") {
      const close = findDelimiter({ src, delim: "]", from: i + 1 });
      const paren = linkTargetEnd(src, close);
      if (close !== -1 && paren !== -1) {
        flush();
        const href = unescapeText(S.slice(src, close + 2, paren));
        nest(S.slice(src, i + 1, close), { ...marks, href });
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
  return pieces;
}

export function parseInlineMarkdown(text: string): ReadonlyArray<InlineRun> {
  const runs = A.reduce(parseSegment(text, {}), [], appendRun);
  return runs;
}

const BULLET_LINE = /^\s*[-*]\s+/;
const ORDERED_LINE = /^\s*\d+[.)]\s+/;

interface OpenList {
  ordered: boolean;
  items: ReadonlyArray<ReadonlyArray<InlineRun>>;
}

interface ParseState {
  blocks: ReadonlyArray<RichBlock>;
  list: OpenList | null;
}

function flushList(state: ParseState): ParseState {
  const { blocks, list } = state;
  if (!list || A.isEmpty(list.items)) return { blocks, list: null };
  const block: RichBlock = {
    type: "list",
    ordered: list.ordered,
    items: list.items,
  };
  return { blocks: A.append(blocks, block), list: null };
}

/** The open list when it matches `ordered`, else a fresh one after a flush. */
function listFor(
  state: ParseState,
  ordered: boolean,
): ParseState & {
  list: OpenList;
} {
  const { list } = state;
  if (list && list.ordered === ordered) return { ...state, list };
  return { ...flushList(state), list: { ordered, items: [] } };
}

interface ReadListLineParams {
  state: ParseState;
  line: string;
  marker: string;
}

function readListLine(params: ReadListLineParams): ParseState {
  const { state, line, marker } = params;
  const current = listFor(state, ORDERED_LINE.test(line));
  const runs = parseInlineMarkdown(
    pipe(line, S.sliceToEnd(S.length(marker)), S.trim),
  );
  if (A.isEmpty(runs)) return current;
  const items = A.append(current.list.items, runs);
  return { ...current, list: { ...current.list, items } };
}

function readLine(state: ParseState, raw: string): ParseState {
  const line = S.trim(raw);
  if (!line) return flushList(state);
  const marker = BULLET_LINE.exec(line) ?? ORDERED_LINE.exec(line);
  if (marker) return readListLine({ state, line, marker: marker[0] });
  const flushed = flushList(state);
  const runs = parseInlineMarkdown(line);
  if (A.isEmpty(runs)) return flushed;
  const block: RichBlock = { type: "paragraph", runs };
  return { ...flushed, blocks: A.append(flushed.blocks, block) };
}

export function markdownToRichBlocks(text: string): ReadonlyArray<RichBlock> {
  const lines = pipe(text, S.splitByRe(/\r?\n/), A.filter(G.isString));
  const initial: ParseState = { blocks: [], list: null };
  const { blocks } = flushList(A.reduce(lines, initial, readLine));
  return blocks;
}

// --- building TipTap documents ---------------------------------------------

type Mark = NonNullable<JSONContent["marks"]>[number];

function runMarks(run: InlineRun): ReadonlyArray<Mark> {
  const candidates: ReadonlyArray<readonly [unknown, Mark]> = [
    [run.bold, { type: "bold" }],
    [run.italic, { type: "italic" }],
    [run.href, { type: "link", attrs: { href: run.href } }],
  ];
  return pipe(
    candidates,
    A.filter(([enabled]) => Boolean(enabled)),
    A.map(([, mark]) => mark),
  );
}

function textNode(run: InlineRun): JSONContent {
  const node: JSONContent = { type: "text", text: run.text };
  const marks = runMarks(run);
  if (A.isEmpty(marks)) return node;
  return { ...node, marks: F.toMutable(marks) };
}

function paragraphNode(runs: ReadonlyArray<InlineRun>): JSONContent {
  return { type: "paragraph", content: F.toMutable(A.map(runs, textNode)) };
}

function blockToTiptap(block: RichBlock): JSONContent {
  if (block.type === "paragraph") return paragraphNode(block.runs);
  const items = A.map(block.items, (item) => ({
    type: "listItem",
    content: [paragraphNode(item)],
  }));
  return {
    type: block.ordered ? "orderedList" : "bulletList",
    content: F.toMutable(items),
  };
}

export function richBlocksToTiptap(
  blocks: ReadonlyArray<RichBlock>,
): JSONContent {
  if (A.isEmpty(blocks)) return emptyRichTextValue();
  return { type: "doc", content: F.toMutable(A.map(blocks, blockToTiptap)) };
}

export function markdownToTiptap(text: string): JSONContent {
  return richBlocksToTiptap(markdownToRichBlocks(text));
}
