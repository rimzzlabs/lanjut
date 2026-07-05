import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

function plainTextOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(plainTextOf).join("");
}

/** A TipTap document field with no content requirement. */
export const richTextDoc = z.custom<JSONContent>(
  (value) => typeof value === "object" && value !== null,
);

/** A TipTap document field that must hold non-whitespace text. */
export function requiredRichTextDoc(message: string) {
  return richTextDoc.refine(
    (doc) => plainTextOf(doc).trim().length > 0,
    message,
  );
}
