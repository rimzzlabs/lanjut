import { type ResumeLanguage, SAMPLE_RESUMES } from "@lanjut/resume";
import type { ResumePreview } from "./resume-preview";
import { resumeToPreview } from "./resume-to-preview";

const SAMPLE_PREVIEWS: Record<ResumeLanguage, ResumePreview> = {
  en: resumeToPreview(SAMPLE_RESUMES.en),
  id: resumeToPreview(SAMPLE_RESUMES.id),
};

/** The sample résumé's preview in a document language. */
export function samplePreview(language: ResumeLanguage): ResumePreview {
  return SAMPLE_PREVIEWS[language];
}
