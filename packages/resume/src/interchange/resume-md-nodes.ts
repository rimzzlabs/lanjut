import { A, G, O, pipe, S } from "@mobily/ts-belt";
import {
  createMarkdownParser,
  defineComarkPlugin,
  type ElementNode,
  type Node as MdNode,
} from "comark";
import { safeHref } from "../link";
import type { InlineRun, RichBlock } from "../rich-content";
import { richBlocksToInterchangeMarkdown } from "./markdown";

// The comark side of the Markdown reader: the parser, and its nodes as the
// rich text of a résumé. resume-md-read.ts turns those nodes into fields.

const RULES_OFF = [
  "table",
  "strikethrough",
  "code",
  "fence",
  "blockquote",
  "hr",
  "lheading",
  "html_block",
  "reference",
  "backticks",
  "image",
  "html_inline",
  "entity",
  "autolink",
];

// A résumé holds headings, paragraphs, lists, bold, italic, and links. Every
// other rule is off, so its text stays as the person typed it.
const dialect = defineComarkPlugin(() => ({
  name: "lanjut-resume",
  markdownItPlugins: [
    (md) => {
      md.disable(RULES_OFF);
      // The default percent-encodes a link, which changes what the person typed.
      md.normalizeLink = (url: string) => url;
    },
  ],
}));

// comark's attributes plugin stays off: it takes any `{braces}` in a line for
// attributes and drops them from the text. `readSectionHeading` reads ours.
const parse = createMarkdownParser({
  registerDefaultPlugins: false,
  linkify: false,
  headingIds: false,
  autoClose: false,
  plugins: [dialect()],
});

export type Nodes = ReadonlyArray<MdNode>;

export const LIST_TAGS = ["ul", "ol"];
const BLOCK_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

export function isElement(node: MdNode): node is ElementNode {
  return G.isArray(node) && G.isString(node[0]);
}

export function hasTag(
  node: MdNode,
  tags: ReadonlyArray<string>,
): node is ElementNode {
  return isElement(node) && A.includes(tags, node[0]);
}

function childrenOf(node: ElementNode): Nodes {
  const [, , ...children] = node;
  return children;
}

export function textOf(nodes: Nodes): string {
  const texts = A.map(nodes, (node) => {
    if (G.isString(node)) return node;
    if (!isElement(node)) return "";
    if (node[0] === "br") return "\n";
    return textOf(childrenOf(node));
  });
  return A.join(texts, "");
}

export function headingOf(node: ElementNode): string {
  return S.trim(textOf(childrenOf(node)));
}

type Marks = Pick<InlineRun, "bold" | "italic" | "href">;

function marksOf(node: ElementNode, marks: Marks): Marks {
  if (node[0] === "strong") return { ...marks, bold: true };
  if (node[0] === "em") return { ...marks, italic: true };
  if (node[0] !== "a") return marks;
  const href = safeHref(String(node[1].href ?? ""));
  if (!href) return marks;
  return { ...marks, href };
}

function inlineRuns(nodes: Nodes, marks: Marks): ReadonlyArray<InlineRun> {
  return A.flatMap(nodes, (node): ReadonlyArray<InlineRun> => {
    if (G.isString(node)) {
      // A line break inside a paragraph is a space, as in any Markdown.
      return [{ ...marks, text: S.replaceByRe(node, /\s*\n\s*/g, " ") }];
    }
    if (!isElement(node)) return [];
    if (node[0] === "br") return [{ ...marks, text: " " }];
    return inlineRuns(childrenOf(node), marksOf(node, marks));
  });
}

function sameMarks(a: InlineRun, b: InlineRun): boolean {
  return (
    Boolean(a.bold) === Boolean(b.bold) &&
    Boolean(a.italic) === Boolean(b.italic) &&
    a.href === b.href
  );
}

function mergeRuns(runs: ReadonlyArray<InlineRun>): ReadonlyArray<InlineRun> {
  const start: ReadonlyArray<InlineRun> = [];
  return A.reduce(runs, start, (merged, run) => {
    if (S.isEmpty(run.text)) return merged;
    const last = A.last(merged);
    if (O.isNone(last) || !sameMarks(last, run)) return A.append(merged, run);
    const joined = { ...last, text: last.text + run.text };
    return A.replaceAt(merged, A.length(merged) - 1, joined);
  });
}

export function plainOf(runs: ReadonlyArray<InlineRun>): string {
  const texts = A.map(runs, (run) => run.text);
  return S.trim(A.join(texts, ""));
}

function runsOf(nodes: Nodes): ReadonlyArray<InlineRun> {
  return mergeRuns(inlineRuns(nodes, {}));
}

/** A loose item holds paragraphs. A space keeps their words apart. */
function spaced(node: MdNode): Nodes {
  if (hasTag(node, BLOCK_TAGS)) return [node, " "];
  return [node];
}

type Items = ReadonlyArray<ReadonlyArray<InlineRun>>;

/** A résumé list is flat, so a nested list gives its items to the outer one. */
function itemRuns(item: ElementNode): Items {
  const children = childrenOf(item);
  const own = pipe(
    children,
    A.reject((child) => hasTag(child, LIST_TAGS)),
    A.flatMap(spaced),
  );
  const nested = pipe(
    children,
    A.filter((child): child is ElementNode => hasTag(child, LIST_TAGS)),
    A.flatMap(listItems),
  );
  const runs = runsOf(own);
  if (S.isEmpty(plainOf(runs))) return nested;
  return A.prepend(nested, runs);
}

export function listItems(list: ElementNode): Items {
  return pipe(childrenOf(list), A.filter(isElement), A.flatMap(itemRuns));
}

function paragraphBlocks(nodes: Nodes): ReadonlyArray<RichBlock> {
  const runs = runsOf(nodes);
  if (S.isEmpty(plainOf(runs))) return [];
  return [{ type: "paragraph", runs }];
}

/** Any block that is not a list reads as a paragraph: a deep heading, for one. */
function richBlocks(node: MdNode): ReadonlyArray<RichBlock> {
  if (G.isString(node)) return paragraphBlocks([node]);
  if (!isElement(node)) return [];
  if (!hasTag(node, LIST_TAGS)) return paragraphBlocks(childrenOf(node));
  const items = listItems(node);
  if (A.isEmpty(items)) return [];
  return [{ type: "list", ordered: node[0] === "ol", items }];
}

export function countBlocks(nodes: Nodes): number {
  return A.length(A.flatMap(nodes, richBlocks));
}

export function richText(nodes: Nodes): string {
  return richBlocksToInterchangeMarkdown(A.flatMap(nodes, richBlocks));
}

function extendLast(lines: ReadonlyArray<Nodes>, nodes: Nodes) {
  const last = O.getWithDefault(A.last(lines), []);
  return A.append(A.initOrEmpty(lines), A.concat(last, nodes));
}

/** A paragraph's inline nodes, cut at each line break. */
export function linesOf(paragraph: ElementNode): ReadonlyArray<Nodes> {
  const start: ReadonlyArray<Nodes> = [[]];
  return A.reduce(childrenOf(paragraph), start, (lines, node) => {
    if (hasTag(node, ["br"])) return A.append(lines, []);
    if (!G.isString(node)) return extendLast(lines, [node]);
    const [first = "", ...rest] = S.split(node, "\n");
    return A.concat(
      extendLast(lines, [first]),
      A.map(rest, (piece): Nodes => [piece]),
    );
  });
}

export async function parseMarkdown(text: string): Promise<Nodes> {
  const tree = await parse(text);
  return tree.nodes;
}
