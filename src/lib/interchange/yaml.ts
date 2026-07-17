import YAML from "yaml";
import type { Resume } from "@/lib/resume";
import { resumeToInterchange } from "./codec";
import { type ParseInterchangeResult, validateInterchange } from "./validate";

/**
 * The human-facing serialization used by the Code tab. Multi-line markdown
 * fields come out as literal block scalars, so rich text reads as plain
 * markdown lines instead of one escaped string.
 */
export function resumeToYaml(resume: Resume): string {
  // lineWidth 0 disables folding and blockQuote forces literal `|` blocks, so
  // every markdown line stays its own line instead of being rewrapped into
  // folded `>` scalars that are hostile to hand-editing.
  return YAML.stringify(resumeToInterchange(resume), {
    lineWidth: 0,
    blockQuote: "literal",
  });
}

export function parseResumeYaml(text: string): ParseInterchangeResult {
  let data: unknown;
  try {
    data = YAML.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, kind: "syntax", message };
  }
  return validateInterchange(data);
}
