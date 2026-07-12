import { RESUME_LABELS } from "@/lib/resume/labels";
import type { ReorderableSectionType } from "@/lib/resume/schema-registry";
import type { SectionColumns } from "@/lib/resume/types";
import type {
  CertificateItemView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  LanguageItemView,
  ResumePreview,
  SkillItemView,
} from "./resume-preview";
import { isRichEmpty, type RichBlock } from "./rich-content";

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
    | { kind: "summary"; body: RichBlock[] }
    | { kind: "experience"; item: ExperienceItemView }
    | { kind: "education"; item: EducationItemView }
    | { kind: "certificate"; item: CertificateItemView }
    | { kind: "skills"; items: SkillItemView[]; columns: SectionColumns }
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
  return Boolean(item.role || item.company) || !isRichEmpty(item.description);
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

// Internship, project, and organization entries reuse the "experience" block
// kind: they render identically in every template and export, only the heading
// differs. Each emitter drops empty entries first, then omits the whole section
// (heading included) when nothing is left, so a sparse résumé shows only filled
// sections.
function experienceLikeBlocks(
  items: ExperienceItemView[],
  headingId: string,
  label: string,
): ResumeBlock[] {
  const filtered = items.filter(hasExperience);
  if (filtered.length === 0) return [];
  return [
    heading(headingId, label),
    ...filtered.map(
      (item, index): ResumeBlock => ({
        id: item.id,
        kind: "experience",
        item,
        gapBefore: entryGap(index),
        keepWithNext: false,
      }),
    ),
  ];
}

function educationBlocks(
  items: EducationItemView[],
  label: string,
): ResumeBlock[] {
  const filtered = items.filter(hasEducation);
  if (filtered.length === 0) return [];
  return [
    heading("education-heading", label),
    ...filtered.map(
      (item, index): ResumeBlock => ({
        id: item.id,
        kind: "education",
        item,
        gapBefore: entryGap(index),
        keepWithNext: false,
      }),
    ),
  ];
}

function certificateBlocks(
  items: CertificateItemView[],
  label: string,
): ResumeBlock[] {
  const filtered = items.filter(hasCertificate);
  if (filtered.length === 0) return [];
  return [
    heading("certificates-heading", label),
    ...filtered.map(
      (item, index): ResumeBlock => ({
        id: item.id,
        kind: "certificate",
        item,
        gapBefore: entryGap(index),
        keepWithNext: false,
      }),
    ),
  ];
}

function skillsBlocks(
  items: SkillItemView[],
  columns: SectionColumns,
  label: string,
): ResumeBlock[] {
  const filtered = items.filter(hasSkill);
  if (filtered.length === 0) return [];
  return [
    heading("skills-heading", label),
    {
      id: "skills-body",
      kind: "skills",
      items: filtered,
      columns,
      gapBefore: GAP.body,
      keepWithNext: false,
    },
  ];
}

function languagesBlocks(
  items: LanguageItemView[],
  label: string,
): ResumeBlock[] {
  const filtered = items.filter(hasLanguage);
  if (filtered.length === 0) return [];
  return [
    heading("languages-heading", label),
    {
      id: "languages-body",
      kind: "languages",
      items: filtered,
      gapBefore: GAP.body,
      keepWithNext: false,
    },
  ];
}

/**
 * Builds the linear block sequence. The Header and Summary are pinned at the top;
 * every other section is emitted in the document's `sectionOrder` (the user's
 * reordering), so pagination, PDF, and text export all follow the same order.
 * Sections with no meaningful content are omitted (heading included).
 */
export function buildResumeBlocks(resume: ResumePreview): ResumeBlock[] {
  const labels = RESUME_LABELS[resume.language];
  const blocks: ResumeBlock[] = [
    {
      id: "header",
      kind: "header",
      header: resume.header,
      gapBefore: 0,
      keepWithNext: false,
    },
  ];

  if (!isRichEmpty(resume.summary)) {
    blocks.push(heading("summary-heading", labels.summary), {
      id: "summary-body",
      kind: "summary",
      body: resume.summary,
      gapBefore: GAP.body,
      keepWithNext: false,
    });
  }

  const emitters: Record<ReorderableSectionType, () => ResumeBlock[]> = {
    experience: () =>
      experienceLikeBlocks(
        resume.experience,
        "experience-heading",
        labels.experience,
      ),
    internship: () =>
      experienceLikeBlocks(
        resume.internship,
        "internship-heading",
        labels.internship,
      ),
    projects: () =>
      experienceLikeBlocks(
        resume.projects,
        "projects-heading",
        labels.projects,
      ),
    organizations: () =>
      experienceLikeBlocks(
        resume.organizations,
        "organizations-heading",
        labels.organizations,
      ),
    education: () => educationBlocks(resume.education, labels.education),
    certifications: () =>
      certificateBlocks(resume.certificates, labels.certificates),
    skills: () =>
      skillsBlocks(resume.skills, resume.skillsColumns, labels.skills),
    languages: () => languagesBlocks(resume.languages, labels.languages),
    // Custom sections carry no preview data yet; wired up in a later increment.
    custom: () => [],
  };

  for (const type of resume.sectionOrder) {
    blocks.push(...emitters[type]());
  }

  return blocks;
}
