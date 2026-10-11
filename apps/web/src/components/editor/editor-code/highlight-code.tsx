import type { CodeFormat } from "@lanjut/resume/interchange/code-edit";
import type { ReactNode } from "react";
import { highlightInterchange } from "../editor-paste/highlight-interchange";
import { highlightMarkdown } from "./highlight-markdown";

export function highlightCode(
  text: string,
  format: CodeFormat,
): ReadonlyArray<ReactNode> {
  if (format === "markdown") return highlightMarkdown(text);
  return highlightInterchange(text, format);
}
