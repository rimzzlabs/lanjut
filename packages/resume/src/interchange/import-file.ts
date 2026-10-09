import { D } from "@mobily/ts-belt";
import { createEmptyResume, type Resume } from "..";
import type { ParseOptions } from "../import";
import type { ResumeContent } from "./codec";
import { parseResumeJson } from "./json";
import type { ParseInterchangeResult } from "./validate";
import { parseResumeYaml } from "./yaml";

export type InterchangeImportResult =
  | { ok: true; resume: Resume; leftovers: string[] }
  | { ok: false };

/** Settings that stay absent on the Resume unless the file sets them. */
const OPTIONAL_SETTINGS = [
  "font",
  "lineHeight",
  "nameScale",
  "titleScale",
  "bodyScale",
  "photoSize",
  "photoRadius",
  "photoAlign",
] as const;

function presentSettings(content: ResumeContent): Partial<Resume> {
  return D.filter(
    D.selectKeys(content, OPTIONAL_SETTINGS),
    (value) => value !== undefined,
  );
}

/**
 * Build a full Resume from a parsed interchange document, from a file or
 * pasted text. Unlike the PDF path this is exact, so there are never
 * leftovers; any validation failure rejects the document wholesale instead of
 * importing a partial one.
 */
export function importParsedResume(
  parsed: ParseInterchangeResult,
  options: ParseOptions,
): InterchangeImportResult {
  if (!parsed.ok) return { ok: false };
  const { content } = parsed;
  const base = createEmptyResume(options.title);
  const resume: Resume = {
    ...base,
    title: content.title || base.title,
    templateId: content.templateId ?? options.templateId,
    language: content.language ?? options.language,
    showIcons: content.showIcons ?? true,
    sectionSpacing: content.sectionSpacing ?? 0,
    letterSpacing: content.letterSpacing ?? 0,
    header: content.header,
    sections: content.sections,
    ...presentSettings(content),
  };
  return { ok: true, resume, leftovers: [] };
}

export function importResumeFromJson(
  text: string,
  options: ParseOptions,
): InterchangeImportResult {
  return importParsedResume(parseResumeJson(text), options);
}

export function importResumeFromYaml(
  text: string,
  options: ParseOptions,
): InterchangeImportResult {
  return importParsedResume(parseResumeYaml(text), options);
}
