import { A, F, G, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { emptyRichTextValue, type Field } from "..";
import { safeHref } from "../link";
import { findUrls, isUrlToken, type PdfLink } from "./links";

// --- field builders --------------------------------------------------------

export function plain(value: string): Field {
  return { kind: "plain", value: S.trim(value) };
}

export const BULLET_RE = /^\s*[•·▪◦●*\-–—]\s+/;

export function trimmedNonEmpty(
  lines: ReadonlyArray<string>,
): readonly string[] {
  return pipe(lines, A.map(S.trim), A.reject(S.isEmpty));
}

const LABEL_PREFIX_RE = /^\p{L}[\p{L} ]{0,23}:\s*/u;
const SEPARATOR_RE = /\s*[|•·,;]\s*/;

/**
 * What counts as a link in a line. In the header, a link label alone
 * ("GitHub") and a bare domain ("rizki.dev") stand for links. In a section,
 * only an address with a scheme, www, or a path does.
 */
export interface LinkLineRules {
  labels: ReadonlySet<string>;
  bareDomains: boolean;
}

export const SECTION_LINK_RULES: LinkLineRules = {
  labels: new Set(),
  bareDomains: false,
};

function parts(text: string, separator: RegExp): ReadonlyArray<string> {
  return pipe(
    text,
    S.splitByRe(separator),
    A.filter(G.isString),
    A.map(S.trim),
    A.reject(S.isEmpty),
  );
}

/**
 * Whether a line holds only links: addresses, an optional "GitHub:" prefix,
 * and in the header link labels such as "GitHub | LinkedIn". Such a line is
 * contact data or the target of a link field, never text to show.
 */
export function isLinkLine(
  line: string,
  rules: LinkLineRules = SECTION_LINK_RULES,
): boolean {
  const body = pipe(
    line,
    S.replaceByRe(BULLET_RE, ""),
    S.trim,
    S.replaceByRe(LABEL_PREFIX_RE, ""),
  );
  const tokens = parts(body, /[\s|•·,;]+/);
  if (A.isEmpty(tokens)) return false;
  const isUrl = (token: string) => isUrlToken(token, rules.bareDomains);
  if (A.every(tokens, isUrl)) return true;
  return A.every(
    parts(body, SEPARATOR_RE),
    (part) => rules.labels.has(part) || isUrl(part),
  );
}

interface Span {
  start: number;
  end: number;
  href: string;
}

function spanOf(text: string, words: string, url: string): Span | undefined {
  const start = S.indexOf(text, words);
  const href = safeHref(url);
  if (O.isNone(start) || href === undefined) return undefined;
  return { start, end: start + S.length(words), href };
}

// A label longer than this is the whole line read as one text run, not the
// words the link sits on, and marking it would turn a sentence into a link.
const MAX_LABEL_WORDS = 5;

function labelSpans(
  text: string,
  links: ReadonlyArray<PdfLink>,
): ReadonlyArray<Span> {
  return A.filterMap(links, (link) => {
    const words = A.length(parts(link.label, /\s+/));
    if (words === 0 || words > MAX_LABEL_WORDS) return undefined;
    // A label with a slash, colon, or @ is a piece of an address, which the
    // address itself already links.
    if (/[/:@]/.test(link.label)) return undefined;
    if (S.length(link.label) >= S.length(text)) return undefined;
    return spanOf(text, link.label, link.url);
  });
}

function urlSpans(text: string): ReadonlyArray<Span> {
  return A.filterMap(findUrls(text), (url) => spanOf(text, url, url));
}

/** Spans in reading order, without overlaps: the first one to start wins. */
function linkSpans(
  text: string,
  links: ReadonlyArray<PdfLink>,
): ReadonlyArray<Span> {
  const sorted = A.sortBy(
    A.concat(urlSpans(text), labelSpans(text, links)),
    (span) => span.start,
  );
  const initial: ReadonlyArray<Span> = [];
  return A.reduce(sorted, initial, (kept, span) => {
    const overlaps = O.mapWithDefault(
      A.last(kept),
      false,
      (last) => span.start < last.end,
    );
    return overlaps ? kept : A.append(kept, span);
  });
}

function textNode(text: string, href?: string): JSONContent {
  if (href === undefined) return { type: "text", text };
  return { type: "text", text, marks: [{ type: "link", attrs: { href } }] };
}

function withText(
  nodes: ReadonlyArray<JSONContent>,
  text: string,
): ReadonlyArray<JSONContent> {
  if (S.isEmpty(text)) return nodes;
  return A.append(nodes, textNode(text));
}

interface RunSplit {
  nodes: ReadonlyArray<JSONContent>;
  from: number;
}

/** The text as runs, with a link mark on each address and each link label. */
function inlineRuns(
  text: string,
  links: ReadonlyArray<PdfLink>,
): ReadonlyArray<JSONContent> {
  const initial: RunSplit = { nodes: [], from: 0 };
  const split = A.reduce(linkSpans(text, links), initial, (acc, span) => {
    const before = withText(acc.nodes, S.slice(text, acc.from, span.start));
    const linked = textNode(S.slice(text, span.start, span.end), span.href);
    return { nodes: A.append(before, linked), from: span.end };
  });
  return withText(split.nodes, S.sliceToEnd(text, split.from));
}

function paragraph(text: string, links: ReadonlyArray<PdfLink>): JSONContent {
  const trimmed = S.trim(text);
  if (S.isEmpty(trimmed)) return { type: "paragraph", content: [] };
  return {
    type: "paragraph",
    content: F.toMutable(inlineRuns(trimmed, links)),
  };
}

function bulletList(
  bullets: ReadonlyArray<string>,
  links: ReadonlyArray<PdfLink>,
): JSONContent {
  return {
    type: "bulletList",
    content: F.toMutable(
      A.map(bullets, (item) => ({
        type: "listItem",
        content: [paragraph(item, links)],
      })),
    ),
  };
}

interface RichBlocks {
  content: ReadonlyArray<JSONContent>;
  bullets: ReadonlyArray<string>;
}

function flushBullets(
  blocks: RichBlocks,
  links: ReadonlyArray<PdfLink>,
): ReadonlyArray<JSONContent> {
  if (A.isEmpty(blocks.bullets)) return blocks.content;
  return A.append(blocks.content, bulletList(blocks.bullets, links));
}

/**
 * Consecutive bulleted lines become one bullet list, everything else a
 * paragraph, so the source structure survives the round trip. Addresses and
 * the PDF's link labels keep their link.
 */
export function richFromLines(
  lines: ReadonlyArray<string>,
  links: ReadonlyArray<PdfLink> = [],
): Field {
  const nonEmpty = trimmedNonEmpty(lines);
  if (A.isEmpty(nonEmpty)) {
    return { kind: "richtext", value: emptyRichTextValue() };
  }
  const initial: RichBlocks = { content: [], bullets: [] };
  const blocks = A.reduce(nonEmpty, initial, (acc, line) => {
    if (BULLET_RE.test(line)) {
      const bullet = S.replaceByRe(line, BULLET_RE, "");
      return { content: acc.content, bullets: A.append(acc.bullets, bullet) };
    }
    return {
      content: A.append(flushBullets(acc, links), paragraph(line, links)),
      bullets: [],
    };
  });
  const content = F.toMutable(flushBullets(blocks, links));
  return { kind: "richtext", value: { type: "doc", content } };
}
