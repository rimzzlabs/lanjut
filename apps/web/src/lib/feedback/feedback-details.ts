import type { Resume } from "@lanjut/resume";
import { templateNameOf } from "@lanjut/resume/templates";
import { S } from "@mobily/ts-belt";
import { LATEST_CHANGELOG_VERSION } from "../changelog";
import { resolveFont } from "../fonts";
import {
  EDITOR_PATHNAME,
  PROFILE_PATHNAME,
  TEMPLATE_PATHNAME,
} from "../routes";
import type { FeedbackDetails, WordingLanguage } from "./feedback-schema";
import { describeUserAgent } from "./user-agent";

export const LANGUAGE_NAMES: Record<WordingLanguage, string> = {
  en: "English",
  id: "Indonesian",
};

/** The page a report was opened from, by name. */
export function pageName(pathname: string, editing: boolean): string {
  if (editing) return "Editor";
  if (S.startsWith(pathname, TEMPLATE_PATHNAME)) return "Templates";
  if (S.startsWith(pathname, PROFILE_PATHNAME)) return "Profiles";
  if (S.startsWith(pathname, EDITOR_PATHNAME)) return "Library";
  if (pathname === "/") return "Home";
  return "Other";
}

/**
 * The look of the open résumé: its template, font, and document language.
 * Settings only; no text of the résumé goes into a report.
 */
export function resumeDetails(
  resume: Resume | null,
): Pick<FeedbackDetails, "template" | "font" | "documentLanguage"> {
  if (!resume) return {};
  const font = resolveFont(resume.font);
  return {
    template: templateNameOf(resume.templateId),
    font: font ? font.family : "Template default",
    documentLanguage: LANGUAGE_NAMES[resume.language],
  };
}

/** This build on the web: its version, the browser, the system, the language. */
export function webDetails(locale: WordingLanguage): FeedbackDetails {
  const { browser, os } = describeUserAgent(navigator.userAgent);
  return {
    app: LATEST_CHANGELOG_VERSION,
    platform: "Web",
    browser,
    os,
    language: LANGUAGE_NAMES[locale],
  };
}
