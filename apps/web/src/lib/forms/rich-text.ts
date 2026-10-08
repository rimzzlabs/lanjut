import { A, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

function plainTextOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return pipe(node.content ?? [], A.map(plainTextOf), A.join(""));
}

/** A TipTap document field with no content requirement. */
export const richTextDoc = z.custom<JSONContent>(
  (value) => typeof value === "object" && value !== null,
);

/** A TipTap document field that must hold non-whitespace text. */
export function requiredRichTextDoc(message: string) {
  return richTextDoc.refine(
    (doc) => S.isNotEmpty(S.trim(plainTextOf(doc))),
    message,
  );
}
