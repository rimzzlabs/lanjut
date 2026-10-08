import {
  applyProfile,
  cloneResumeAsNew,
  createEmptyResume,
  type Profile,
  type Resume,
  type ResumeLanguage,
  SEED_RESUME,
} from "@lanjut/resume";
import { nanoid } from "nanoid";

export interface CreateResumeOptions {
  templateId?: string;
  /**
   * Where the starting content comes from: the sample fixture (default), a blank
   * document, or a parsed PDF import. When `import`, `imported` carries the
   * already-parsed document and its leftovers.
   */
  source?: "sample" | "empty" | "import";
  imported?: { resume: Resume; leftovers: string[] };
  /** Document label language; defaults to English when omitted. */
  language?: ResumeLanguage;
  /**
   * Fills the header and the summary of a sample or blank start. An import
   * keeps what the file holds.
   */
  profile?: Profile;
}

/** The document a new résumé starts from: an import, a blank page, or the sample. */
function startingResume(title: string, options?: CreateResumeOptions): Resume {
  if (options?.source === "import" && options.imported) {
    // The imported document is already parsed; adopt it, retitle it, and give
    // it a fresh id so it never collides with the fixture's placeholder ids.
    return { ...options.imported.resume, id: nanoid(), title };
  }
  if (options?.source === "empty") return createEmptyResume(title);
  return cloneResumeAsNew(SEED_RESUME, title);
}

/** A sample or blank start takes its header and summary from the profile. */
function withProfile(resume: Resume, options?: CreateResumeOptions): Resume {
  if (!options?.profile || options.source === "import") return resume;
  return applyProfile(resume, options.profile);
}

/**
 * The document `createResume` saves, built without saving it, so the create
 * flow can preview exactly what the user gets.
 */
export function buildNewResume(
  title: string,
  options?: CreateResumeOptions,
): Resume {
  const base = withProfile(startingResume(title, options), options);
  return {
    ...base,
    templateId: options?.templateId || base.templateId,
    language: options?.language || base.language,
  };
}
