/**
 * View-model contract consumed by the editor's static preview components. This is
 * deliberately decoupled from the persisted `Resume` domain model (see
 * `@/lib/resume/types`): an adapter will project a `Resume` into this shape, so
 * the presentation components never read the storage schema directly.
 *
 * Data → adapter → consumer: these types are the consumer contract.
 */

import type { RichBlock } from "@/lib/resume/rich-content";
import type { ReorderableSectionType } from "@/lib/resume/schema-registry";
import type {
  CustomVariant,
  ResumeLanguage,
  SectionColumns,
} from "@/lib/resume/types";

export type ContactKind =
  | "phone"
  | "email"
  | "website"
  | "linkedin"
  | "location";

export interface ContactView {
  kind: ContactKind;
  /** Human-readable text shown to the reader. */
  value: string;
  /** Optional link target. Absent for non-navigable contacts (e.g. location). */
  href?: string;
}

export interface HeaderView {
  fullName: string;
  headline: string;
  contacts: ContactView[];
  /** Presentation-only: whether contact icon glyphs are drawn; defaults to true. */
  showIcons: boolean;
}

export interface ExperienceItemView {
  id: string;
  role: string;
  company: string;
  companyHref?: string;
  startDate: string;
  endDate: string;
  description: RichBlock[];
}

export interface EducationItemView {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  details: RichBlock[];
}

export interface CertificateItemView {
  id: string;
  title: string;
  issuer: string;
  href?: string;
  startDate: string;
  endDate: string;
}

export interface SkillItemView {
  id: string;
  name: string;
  proficiency: string;
}

export interface LanguageItemView {
  id: string;
  name: string;
  proficiency: string;
}

/**
 * A user-defined custom section. `rich` renders its `body` like Summary; `list`
 * renders its `entries` through the experience path. Both are carried so the
 * block builder can pick by `variant`, and each is addressed by `id` from the
 * section order (unlike core sections, several custom sections can coexist).
 */
export interface CustomSectionView {
  id: string;
  title: string;
  variant: CustomVariant;
  body: RichBlock[];
  entries: ExperienceItemView[];
}

/** A reference to a reorderable section in reading order, addressable by id. */
export interface SectionRef {
  type: ReorderableSectionType;
  id: string;
}

/**
 * The effective heading per core section: the stored section title when the
 * user renamed it away from the registry default (only possible through the
 * Code tab), otherwise the document-language label.
 */
export type SectionHeadings = Record<
  "summary" | Exclude<ReorderableSectionType, "custom">,
  string
>;

export interface ResumePreview {
  /** Document language for fixed labels (headings, dates); drives localization. */
  language: ResumeLanguage;
  /**
   * Presentation-only space adjustment above each section heading (px on
   * screen, pt in PDF), on top of the template's baseline rhythm; 0 =
   * baseline, clamped to -24..60 so the gap can reach flush but never
   * negative.
   */
  sectionSpacing: number;
  /**
   * Resolved document font id from the catalog, or null for the template's
   * shipped families. Applies to the whole document in preview and PDF.
   */
  font: string | null;
  /**
   * Document-wide tracking (px on screen, pt in PDF), clamped to the
   * extraction-safe -0.5..0.5 range; 0 = template default (no tracking).
   */
  letterSpacing: number;
  /**
   * Document-wide unitless line height (clamped 1.2..2), or null for the
   * template's baseline (TEMPLATE_LINE_HEIGHT).
   */
  lineHeight: number | null;
  headings: SectionHeadings;
  /**
   * The reorderable sections in document (reading) order. Drives the order blocks
   * are emitted in after the pinned Header and Summary. Core types appear at most
   * once; `custom` may repeat, so each ref carries the section `id` used to look
   * it up in `customSections`. Empty sections are gated out at block-build time.
   */
  sectionOrder: SectionRef[];
  /** Custom sections by id, resolved from `sectionOrder` refs of type `custom`. */
  customSections: CustomSectionView[];
  header: HeaderView;
  summary: RichBlock[];
  experience: ExperienceItemView[];
  /**
   * Internship entries are structurally identical to experience (same fields),
   * so they reuse `ExperienceItemView` and every renderer's experience path;
   * only the section heading differs.
   */
  internship: ExperienceItemView[];
  /**
   * Project entries reuse `ExperienceItemView`: `role` holds the project name
   * and `company` the contributor role, so they render through the experience
   * path in every template and export; only the section heading differs.
   */
  projects: ExperienceItemView[];
  /**
   * Organization entries (volunteer, student, community roles) are
   * presentationally identical to experience entries, so they reuse
   * `ExperienceItemView` (`company` holds the organization name) and every
   * renderer's experience path.
   */
  organizations: ExperienceItemView[];
  education: EducationItemView[];
  certificates: CertificateItemView[];
  skills: SkillItemView[];
  /** Presentation-only column count for the skills grid; defaults to two. */
  skillsColumns: SectionColumns;
  languages: LanguageItemView[];
  /** Presentation-only column count for the languages grid; defaults to two. */
  languagesColumns: SectionColumns;
}
