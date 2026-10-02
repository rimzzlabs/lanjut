import { A, F, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { emptyRichTextValue, type Field } from "@/lib/resume";

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

function paragraph(text: string): JSONContent {
  const trimmed = S.trim(text);
  if (S.isEmpty(trimmed)) return { type: "paragraph", content: [] };
  return { type: "paragraph", content: [{ type: "text", text: trimmed }] };
}

function bulletList(bullets: ReadonlyArray<string>): JSONContent {
  return {
    type: "bulletList",
    content: F.toMutable(
      A.map(bullets, (item) => ({
        type: "listItem",
        content: [paragraph(item)],
      })),
    ),
  };
}

interface RichBlocks {
  content: ReadonlyArray<JSONContent>;
  bullets: ReadonlyArray<string>;
}

function flushBullets(blocks: RichBlocks): ReadonlyArray<JSONContent> {
  if (A.isEmpty(blocks.bullets)) return blocks.content;
  return A.append(blocks.content, bulletList(blocks.bullets));
}

/** Consecutive bulleted lines become one bullet list, everything else a
 * paragraph, so the source structure survives the round trip. */
export function richFromLines(lines: ReadonlyArray<string>): Field {
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
      content: A.append(flushBullets(acc), paragraph(line)),
      bullets: [],
    };
  });
  const content = F.toMutable(flushBullets(blocks));
  return { kind: "richtext", value: { type: "doc", content } };
}
