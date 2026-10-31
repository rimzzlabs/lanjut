import { SEED_RESUME } from "./seed";
import { SEED_RESUME_ID } from "./seed-id";
import type { Resume, ResumeLanguage } from "./types";

/** The sample résumé in each document language. */
export const SAMPLE_RESUMES: Record<ResumeLanguage, Resume> = {
  en: SEED_RESUME,
  id: SEED_RESUME_ID,
};

export const SAMPLE_RESUME_LIST: ReadonlyArray<Resume> = [
  SEED_RESUME,
  SEED_RESUME_ID,
];
