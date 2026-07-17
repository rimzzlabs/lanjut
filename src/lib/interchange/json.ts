import type { Resume } from "@/lib/resume";
import { resumeToInterchange } from "./codec";
import { type ParseInterchangeResult, validateInterchange } from "./validate";

export function resumeToJson(resume: Resume): string {
  return `${JSON.stringify(resumeToInterchange(resume), null, 2)}\n`;
}

export function parseResumeJson(text: string): ParseInterchangeResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, kind: "syntax", message };
  }
  return validateInterchange(data);
}
