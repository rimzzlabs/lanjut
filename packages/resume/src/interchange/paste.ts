import { parseResumeJson } from "./json";
import type { ParseInterchangeResult } from "./validate";
import { parseResumeYaml } from "./yaml";

export type InterchangeFormat = "json" | "yaml";

/** Pasted text is JSON when it opens with a brace or a bracket, else YAML. */
export function detectInterchangeFormat(text: string): InterchangeFormat {
  return /^\s*[[{]/.test(text) ? "json" : "yaml";
}

export function parseInterchangeText(
  text: string,
  format: InterchangeFormat,
): ParseInterchangeResult {
  if (format === "json") return parseResumeJson(text);
  return parseResumeYaml(text);
}
