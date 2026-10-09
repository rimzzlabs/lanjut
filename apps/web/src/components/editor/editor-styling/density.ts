import type { Resume } from "@lanjut/resume";
import {
  resolveTemplateId,
  TEMPLATE_LINE_HEIGHT,
} from "@lanjut/resume/templates";
import { A, D, type O } from "@mobily/ts-belt";

export type Density = "compact" | "balanced" | "airy";

export const DENSITIES: ReadonlyArray<Density> = [
  "compact",
  "balanced",
  "airy",
];

// The room between sections in px, and the line height as an offset from the
// template's own, so a preset reads the same in every template. Letter
// spacing is not density, so no preset touches it.
const PRESETS: Record<Density, { sectionSpacing: number; lineHeight: number }> =
  {
    compact: { sectionSpacing: -12, lineHeight: -0.1 },
    balanced: { sectionSpacing: 0, lineHeight: 0 },
    airy: { sectionSpacing: 16, lineHeight: 0.15 },
  };

const LINE_HEIGHT_MIN = 1.2;
const LINE_HEIGHT_MAX = 2;

function baseLineHeight(resume: Resume): number {
  return TEMPLATE_LINE_HEIGHT[resolveTemplateId(resume.templateId)];
}

function presetLineHeight(resume: Resume, density: Density): number {
  const raw = baseLineHeight(resume) + PRESETS[density].lineHeight;
  const clamped = Math.min(LINE_HEIGHT_MAX, Math.max(LINE_HEIGHT_MIN, raw));
  return Math.round(clamped * 100) / 100;
}

/** Sets the room between sections and lines to a preset, in one step. */
export function applyDensity(resume: Resume, density: Density): Resume {
  const sectionSpacing = PRESETS[density].sectionSpacing;
  // Balanced hands the line height back to the template.
  if (density === "balanced") {
    return { ...D.deleteKey(resume, "lineHeight"), sectionSpacing };
  }
  return {
    ...resume,
    sectionSpacing,
    lineHeight: presetLineHeight(resume, density),
  };
}

/** The preset the résumé matches, or None once the sliders moved off it. */
export function densityOf(resume: Resume): O.Option<Density> {
  const lineHeight = resume.lineHeight ?? baseLineHeight(resume);
  return A.find(
    DENSITIES,
    (density) =>
      (resume.sectionSpacing ?? 0) === PRESETS[density].sectionSpacing &&
      Math.abs(lineHeight - presetLineHeight(resume, density)) < 0.001,
  );
}
