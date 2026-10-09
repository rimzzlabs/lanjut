import type { Resume } from "@lanjut/resume";
import { D } from "@mobily/ts-belt";

export type StyleGroupId = "typography" | "spacing";

interface StyleGroup {
  /** Whether every setting in the group still has its default. */
  isDefault: (resume: Resume) => boolean;
  reset: (resume: Resume) => Resume;
}

// A deleted setting falls back to the template's own value.
export const STYLE_GROUPS: Record<StyleGroupId, StyleGroup> = {
  typography: {
    isDefault: (resume) =>
      !resume.font &&
      (resume.nameScale ?? 1) === 1 &&
      (resume.titleScale ?? 1) === 1 &&
      (resume.bodyScale ?? 1) === 1,
    reset: (resume) =>
      D.deleteKeys(resume, ["font", "nameScale", "titleScale", "bodyScale"]),
  },
  spacing: {
    isDefault: (resume) =>
      (resume.sectionSpacing ?? 0) === 0 &&
      resume.lineHeight == null &&
      (resume.letterSpacing ?? 0) === 0,
    reset: (resume) => ({
      ...D.deleteKey(resume, "lineHeight"),
      sectionSpacing: 0,
      letterSpacing: 0,
    }),
  },
};
