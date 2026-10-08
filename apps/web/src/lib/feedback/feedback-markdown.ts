import { A, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";

const LIST_INDENT = "   ";

/** Characters GitHub would read as formatting, made literal. */
function escapeText(text: string): string {
  return S.replaceByRe(text, /[\\`*_[\]<>#|~]/g, "\\$&");
}

function markOf(mark: { type: string }) {
  return mark.type;
}

function hrefOf(attrs: Record<string, unknown> | undefined): O.Option<string> {
  const href = attrs?.href;
  if (typeof href !== "string") return O.None;
  return O.Some(href);
}

/** One run of text with its marks, as GitHub Markdown. */
function inlineOf(node: JSONContent): string {
  if (node.type !== "text" || !node.text) return "";
  const marks = pipe(node.marks ?? [], A.map(markOf));
  const text = escapeText(node.text);
  const bold = A.includes(marks, "bold") ? `**${text}**` : text;
  const italic = A.includes(marks, "italic") ? `_${bold}_` : bold;
  // Markdown has no underline; GitHub keeps <ins> and shows it underlined.
  const underlined = A.includes(marks, "underline")
    ? `<ins>${italic}</ins>`
    : italic;
  const href = pipe(
    node.marks ?? [],
    A.find((mark) => mark.type === "link"),
    O.flatMap((mark) => hrefOf(mark.attrs)),
  );
  if (O.isNone(href)) return underlined;
  return `[${underlined}](<${href}>)`;
}

/**
 * A paragraph that starts like a list item ("- City", "1. Step") stays a
 * paragraph: the marker is escaped, so GitHub does not make it a list.
 */
function literalStart(text: string): string {
  return pipe(
    text,
    S.replaceByRe(/^([-+])(\s)/, "\\$1$2"),
    S.replaceByRe(/^(\d+)([.)])(\s)/, "$1\\$2$3"),
  );
}

function inlinesOf(node: JSONContent): string {
  return pipe(node.content ?? [], A.map(inlineOf), A.join(""));
}

function indent(text: string, by: string): string {
  return pipe(
    S.split(text, "\n"),
    A.map((line) => (S.isEmpty(line) ? line : `${by}${line}`)),
    A.join("\n"),
  );
}

function listItemOf(item: JSONContent, marker: string): string {
  const [first = "", ...rest] = pipe(item.content ?? [], A.map(blockOf));
  const nested = pipe(
    rest,
    A.map((block) => indent(block, LIST_INDENT)),
  );
  return pipe([`${marker} ${first}`, ...nested], A.join("\n"));
}

function blockOf(node: JSONContent): string {
  switch (node.type) {
    case "paragraph":
      return literalStart(inlinesOf(node));
    case "bulletList":
      return pipe(
        node.content ?? [],
        A.map((item) => listItemOf(item, "-")),
        A.join("\n"),
      );
    case "orderedList": {
      const start =
        typeof node.attrs?.start === "number" ? node.attrs.start : 1;
      return pipe(
        node.content ?? [],
        A.mapWithIndex((index, item) => listItemOf(item, `${start + index}.`)),
        A.join("\n"),
      );
    }
    default:
      return inlinesOf(node);
  }
}

/**
 * A feedback field's rich text as GitHub Markdown: paragraphs, bullet and
 * numbered lists, bold, italic, underline, and links. Everything else the
 * reporter typed stays literal text.
 */
export function richToMarkdown(doc: JSONContent): string {
  return pipe(
    doc.content ?? [],
    A.map(blockOf),
    A.filter((block) => S.isNotEmpty(S.trim(block))),
    A.join("\n\n"),
  );
}

function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return pipe(node.content ?? [], A.map(textOf), A.join(" "));
}

/** True when the document holds no text worth sending. */
export function isRichEmpty(doc: JSONContent): boolean {
  return S.isEmpty(S.trim(textOf(doc)));
}
