import type { ParseOptions } from "@/lib/import";
import { createEmptyResume, type Resume } from "@/lib/resume";
import { parseResumeJson } from "./json";
import type { ParseInterchangeResult } from "./validate";
import { parseResumeYaml } from "./yaml";

export type InterchangeImportResult =
  | { ok: true; resume: Resume; leftovers: string[] }
  | { ok: false };

/**
 * Build a full Resume from an exported interchange file. Unlike the PDF path
 * this is exact, so there are never leftovers; any validation failure rejects
 * the file wholesale instead of importing a partial document.
 */
function buildImportedResume(
  parsed: ParseInterchangeResult,
  options: ParseOptions,
): InterchangeImportResult {
  if (!parsed.ok) return { ok: false };
  const resume = createEmptyResume(options.title);
  resume.header = parsed.content.header;
  resume.sections = parsed.content.sections;
  resume.templateId = parsed.content.templateId ?? options.templateId;
  resume.language = parsed.content.language ?? options.language;
  resume.showIcons = parsed.content.showIcons ?? true;
  resume.sectionSpacing = parsed.content.sectionSpacing ?? 0;
  if (parsed.content.font !== undefined) resume.font = parsed.content.font;
  resume.letterSpacing = parsed.content.letterSpacing ?? 0;
  if (parsed.content.lineHeight !== undefined) {
    resume.lineHeight = parsed.content.lineHeight;
  }
  if (parsed.content.title) resume.title = parsed.content.title;
  return { ok: true, resume, leftovers: [] };
}

export function importResumeFromJson(
  text: string,
  options: ParseOptions,
): InterchangeImportResult {
  return buildImportedResume(parseResumeJson(text), options);
}

export function importResumeFromYaml(
  text: string,
  options: ParseOptions,
): InterchangeImportResult {
  return buildImportedResume(parseResumeYaml(text), options);
}
