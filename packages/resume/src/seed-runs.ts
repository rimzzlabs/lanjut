import type { JSONContent } from "@tiptap/core";
import type { Field } from "./types";

// Short builders for the sample résumés' fields and TipTap runs.

export function plain(value: string): Field {
  return { kind: "plain", value };
}

export function t(text: string): JSONContent {
  return { type: "text", text };
}

export function b(text: string): JSONContent {
  return { type: "text", text, marks: [{ type: "bold" }] };
}

export function i(text: string): JSONContent {
  return { type: "text", text, marks: [{ type: "italic" }] };
}

export function link(text: string, href: string): JSONContent {
  return { type: "text", text, marks: [{ type: "link", attrs: { href } }] };
}

export function p(...runs: JSONContent[]): JSONContent {
  return { type: "paragraph", content: runs };
}

export function li(...runs: JSONContent[]): JSONContent {
  return { type: "listItem", content: [p(...runs)] };
}

export function ul(...items: JSONContent[]): JSONContent {
  return { type: "bulletList", content: items };
}

export function prose(...blocks: JSONContent[]): Field {
  return { kind: "richtext", value: { type: "doc", content: blocks } };
}
