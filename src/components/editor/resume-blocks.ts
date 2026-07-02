import type {
  CertificateItemView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  LanguageItemView,
  ResumePreview,
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
    | { kind: "skills"; items: string[] }
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

export function buildResumeBlocks(resume: ResumePreview): ResumeBlock[] {
  const blocks: ResumeBlock[] = [
    {
      id: "header",
      kind: "header",
      header: resume.header,
      gapBefore: 0,
      keepWithNext: false,
    },
    heading("summary-heading", "Summary"),
    {
      id: "summary-body",
      kind: "summary",
      body: resume.summary,
      gapBefore: GAP.body,
      keepWithNext: false,
    },
    heading("experience-heading", "Experience"),
    ...resume.experience.map(
      (item, index): ResumeBlock => ({
        id: item.id,
        kind: "experience",
        item,
        gapBefore: entryGap(index),
        keepWithNext: false,
      }),
    ),
    heading("education-heading", "Education"),
    ...resume.education.map(
      (item, index): ResumeBlock => ({
        id: item.id,
        kind: "education",
        item,
        gapBefore: entryGap(index),
        keepWithNext: false,
      }),
    ),
    heading("certificates-heading", "Certificates"),
    ...resume.certificates.map(
      (item, index): ResumeBlock => ({
        id: item.id,
        kind: "certificate",
        item,
        gapBefore: entryGap(index),
        keepWithNext: false,
      }),
    ),
    heading("skills-heading", "Skills"),
    {
      id: "skills-body",
      kind: "skills",
      items: resume.skills,
      gapBefore: GAP.body,
      keepWithNext: false,
    },
    heading("languages-heading", "Languages"),
    {
      id: "languages-body",
      kind: "languages",
      items: resume.languages,
      gapBefore: GAP.body,
      keepWithNext: false,
    },
  ];

  return blocks;
}
