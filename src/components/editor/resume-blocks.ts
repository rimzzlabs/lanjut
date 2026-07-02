import type {
  CertificateItemView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  LanguageItemView,
  ResumePreview,
  SkillItemView,
} from "./resume-preview";

/**
 * Pagination metadata shared by every block. `keepWithNext` glues a block to the
 * one after it (a section heading to its first entry) so a heading can never be
 * orphaned at the foot of a page. `gapBefore` is the vertical space (px) that
 * precedes the block when it is *not* the first on its page.
 */
interface BlockMeta {
  id: string;
  gapBefore: number;
  keepWithNext: boolean;
}

/**
 * The atomic units of the document, in linear reading order. Pagination groups
 * this sequence into pages without ever reordering it, so parse/export order is
 * preserved (see AGENTS.md two-layer rule).
 */
export type ResumeBlock = BlockMeta &
  (
    | { kind: "header"; header: HeaderView }
    | { kind: "heading"; title: string }
    | { kind: "summary"; body: string }
    | { kind: "experience"; item: ExperienceItemView }
    | { kind: "education"; item: EducationItemView }
    | { kind: "certificate"; item: CertificateItemView }
    | { kind: "skills"; items: SkillItemView[] }
    | { kind: "languages"; items: LanguageItemView[] }
  );

const GAP = {
  /** Space above a section heading. */
  section: 24,
  /** Space above a singleton section's body (summary, skills, languages). */
  body: 8,
  /** Space between repeated entries within a section. */
  entry: 16,
  /** Space above the first entry, directly under its heading. */
  firstEntry: 8,
} as const;

function heading(id: string, title: string): ResumeBlock {
  return {
    id,
    kind: "heading",
    title,
    gapBefore: GAP.section,
    keepWithNext: true,
  };
}

function entryGap(index: number): number {
  return index === 0 ? GAP.firstEntry : GAP.entry;
}

function hasExperience(item: ExperienceItemView): boolean {
  return Boolean(item.role || item.company || item.highlights.length > 0);
}

function hasEducation(item: EducationItemView): boolean {
  return Boolean(item.degree || item.institution);
}

function hasCertificate(item: CertificateItemView): boolean {
  return Boolean(item.title || item.issuer);
}

function hasSkill(item: SkillItemView): boolean {
  return Boolean(item.name);
}

function hasLanguage(item: LanguageItemView): boolean {
  return Boolean(item.name);
}

/**
 * Builds the linear block sequence, omitting any section — heading included —
 * that has no meaningful content, so a sparse résumé shows only what the user
 * filled in. Empty repeated entries are dropped before a section is weighed.
 */
export function buildResumeBlocks(resume: ResumePreview): ResumeBlock[] {
  const blocks: ResumeBlock[] = [
    {
      id: "header",
      kind: "header",
      header: resume.header,
      gapBefore: 0,
      keepWithNext: false,
    },
  ];

  const summary = resume.summary.trim();
  if (summary) {
    blocks.push(heading("summary-heading", "Summary"), {
      id: "summary-body",
      kind: "summary",
      body: summary,
      gapBefore: GAP.body,
      keepWithNext: false,
    });
  }

  const experience = resume.experience.filter(hasExperience);
  if (experience.length > 0) {
    blocks.push(
      heading("experience-heading", "Experience"),
      ...experience.map(
        (item, index): ResumeBlock => ({
          id: item.id,
          kind: "experience",
          item,
          gapBefore: entryGap(index),
          keepWithNext: false,
        }),
      ),
    );
  }

  const education = resume.education.filter(hasEducation);
  if (education.length > 0) {
    blocks.push(
      heading("education-heading", "Education"),
      ...education.map(
        (item, index): ResumeBlock => ({
          id: item.id,
          kind: "education",
          item,
          gapBefore: entryGap(index),
          keepWithNext: false,
        }),
      ),
    );
  }

  const certificates = resume.certificates.filter(hasCertificate);
  if (certificates.length > 0) {
    blocks.push(
      heading("certificates-heading", "Certificates"),
      ...certificates.map(
        (item, index): ResumeBlock => ({
          id: item.id,
          kind: "certificate",
          item,
          gapBefore: entryGap(index),
          keepWithNext: false,
        }),
      ),
    );
  }

  const skills = resume.skills.filter(hasSkill);
  if (skills.length > 0) {
    blocks.push(heading("skills-heading", "Skills"), {
      id: "skills-body",
      kind: "skills",
      items: skills,
      gapBefore: GAP.body,
      keepWithNext: false,
    });
  }

  const languages = resume.languages.filter(hasLanguage);
  if (languages.length > 0) {
    blocks.push(heading("languages-heading", "Languages"), {
      id: "languages-body",
      kind: "languages",
      items: languages,
      gapBefore: GAP.body,
      keepWithNext: false,
    });
  }

  return blocks;
}
