/**
 * View-model contract consumed by the editor's static preview components. This is
 * deliberately decoupled from the persisted `Resume` domain model (see
 * `@/lib/resume/types`): an adapter will project a `Resume` into this shape, so
 * the presentation components never read the storage schema directly.
 *
 * Data → adapter → consumer: these types are the consumer contract.
 */

import type { RichBlock } from "./rich-content";

export type ContactKind = "phone" | "email" | "website" | "location";

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

export interface ResumePreview {
  header: HeaderView;
  summary: RichBlock[];
  experience: ExperienceItemView[];
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
  languages: LanguageItemView[];
}
