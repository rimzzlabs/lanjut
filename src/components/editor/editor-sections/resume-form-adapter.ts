import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import { emptyRichTextValue } from "@/lib/resume";
import type { Entry, Field, Resume, Section } from "@/lib/resume/types";

export interface PersonalFormValues {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  province: string;
  country: string;
}

export interface SummaryFormValues {
  summary: JSONContent;
}

export interface ExperienceItemValues {
  title: string;
  company: string;
  website: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface ExperienceFormValues {
  experiences: ExperienceItemValues[];
}

export interface OrganizationItemValues {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface OrganizationsFormValues {
  organizations: OrganizationItemValues[];
}

export interface EducationItemValues {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  details: JSONContent;
}

export interface EducationFormValues {
  educations: EducationItemValues[];
}

export interface SkillItemValues {
  name: string;
  level: string;
}

export interface SkillsFormValues {
  skills: SkillItemValues[];
}

export interface CertificationItemValues {
  name: string;
  issuer: string;
  url: string;
}

export interface CertificationsFormValues {
  certifications: CertificationItemValues[];
}

export interface LanguageItemValues {
  name: string;
  level: string;
}

export interface LanguagesFormValues {
  languages: LanguageItemValues[];
}

function plainValue(field: Field | undefined): string {
  return field?.kind === "plain" ? field.value : "";
}

function richValue(field: Field | undefined): JSONContent {
  return field?.kind === "richtext" ? field.value : emptyRichTextValue();
}

function plain(value: string): Field {
  return { kind: "plain", value };
}

function rich(value: JSONContent): Field {
  return { kind: "richtext", value };
}

function sectionOfType(
  resume: Resume,
  type: Section["type"],
): Section | undefined {
  return resume.sections.find((section) => section.type === type);
}

/**
 * Keep entry ids stable across form-driven rebuilds by reusing the existing
 * entry's id at the same index. Regenerating ids on every keystroke invalidates
 * everything keyed by them downstream, most visibly the preview's measured
 * block heights, which collapsed pagination to a single page.
 */
function entryId(section: Section, index: number): string {
  return section.entries[index]?.id ?? nanoid();
}

// --- Personal (header + summary section) -----------------------------------

export function toPersonalValues(resume: Resume): PersonalFormValues {
  const fields = resume.header.fields;
  return {
    firstName: plainValue(fields.firstName),
    lastName: plainValue(fields.lastName),
    jobTitle: plainValue(fields.jobTitle),
    email: plainValue(fields.email),
    phone: plainValue(fields.phone),
    website: plainValue(fields.website),
    city: plainValue(fields.city),
    province: plainValue(fields.province),
    country: plainValue(fields.country),
  };
}

export function applyPersonalValues(
  draft: Resume,
  values: PersonalFormValues,
): void {
  const fields = draft.header.fields;
  fields.firstName = plain(values.firstName);
  fields.lastName = plain(values.lastName);
  fields.jobTitle = plain(values.jobTitle);
  fields.email = plain(values.email);
  fields.phone = plain(values.phone);
  fields.website = plain(values.website);
  fields.city = plain(values.city);
  fields.province = plain(values.province);
  fields.country = plain(values.country);
}

// --- Summary (singleton section, single rich-text body) --------------------

export function toSummaryValues(resume: Resume): SummaryFormValues {
  const body = sectionOfType(resume, "summary")?.entries[0]?.fields.body;
  return { summary: richValue(body) };
}

export function applySummaryValues(
  draft: Resume,
  values: SummaryFormValues,
): void {
  const section = sectionOfType(draft, "summary");
  if (!section) return;
  const entry = section.entries[0];
  if (entry) {
    entry.fields.body = rich(values.summary);
    return;
  }
  section.entries = [{ id: nanoid(), fields: { body: rich(values.summary) } }];
}

// --- Experience (repeating section entries) --------------------------------

export function experienceEntries(resume: Resume): Entry[] {
  return sectionOfType(resume, "experience")?.entries ?? [];
}

export function toExperienceValues(resume: Resume): ExperienceFormValues {
  return {
    experiences: experienceEntries(resume).map((entry) => ({
      title: plainValue(entry.fields.title),
      company: plainValue(entry.fields.company),
      website: plainValue(entry.fields.website),
      startDate: plainValue(entry.fields.startDate),
      endDate: plainValue(entry.fields.endDate),
      description: richValue(entry.fields.description),
    })),
  };
}

export function applyExperienceValues(
  draft: Resume,
  values: ExperienceFormValues,
): void {
  const section = sectionOfType(draft, "experience");
  if (!section) return;
  section.entries = values.experiences.map((item, index) => ({
    id: entryId(section, index),
    fields: {
      title: plain(item.title),
      company: plain(item.company),
      website: plain(item.website),
      startDate: plain(item.startDate),
      endDate: plain(item.endDate),
      description: rich(item.description),
    },
  }));
}

// --- Organizations (repeating section entries) ------------------------------

export function organizationEntries(resume: Resume): Entry[] {
  return sectionOfType(resume, "organizations")?.entries ?? [];
}

export function toOrganizationsValues(resume: Resume): OrganizationsFormValues {
  return {
    organizations: organizationEntries(resume).map((entry) => ({
      role: plainValue(entry.fields.role),
      organization: plainValue(entry.fields.organization),
      startDate: plainValue(entry.fields.startDate),
      endDate: plainValue(entry.fields.endDate),
      description: richValue(entry.fields.description),
    })),
  };
}

export function applyOrganizationsValues(
  draft: Resume,
  values: OrganizationsFormValues,
): void {
  const section = sectionOfType(draft, "organizations");
  if (!section) return;
  section.entries = values.organizations.map((item, index) => ({
    id: entryId(section, index),
    fields: {
      role: plain(item.role),
      organization: plain(item.organization),
      startDate: plain(item.startDate),
      endDate: plain(item.endDate),
      description: rich(item.description),
    },
  }));
}

// --- Education (repeating section entries) ----------------------------------

export function educationEntries(resume: Resume): Entry[] {
  return sectionOfType(resume, "education")?.entries ?? [];
}

export function toEducationValues(resume: Resume): EducationFormValues {
  return {
    educations: educationEntries(resume).map((entry) => ({
      institution: plainValue(entry.fields.institution),
      degree: plainValue(entry.fields.degree),
      location: plainValue(entry.fields.location),
      startDate: plainValue(entry.fields.startDate),
      endDate: plainValue(entry.fields.endDate),
      details: richValue(entry.fields.details),
    })),
  };
}

export function applyEducationValues(
  draft: Resume,
  values: EducationFormValues,
): void {
  const section = sectionOfType(draft, "education");
  if (!section) return;
  section.entries = values.educations.map((item, index) => ({
    id: entryId(section, index),
    fields: {
      institution: plain(item.institution),
      degree: plain(item.degree),
      location: plain(item.location),
      startDate: plain(item.startDate),
      endDate: plain(item.endDate),
      details: rich(item.details),
    },
  }));
}

// --- Skills (repeating section, one plain name per skill) -------------------

export function skillsEntries(resume: Resume): Entry[] {
  return sectionOfType(resume, "skills")?.entries ?? [];
}

export function toSkillsValues(resume: Resume): SkillsFormValues {
  return {
    skills: skillsEntries(resume).map((entry) => ({
      name: plainValue(entry.fields.name),
      level: plainValue(entry.fields.level),
    })),
  };
}

export function applySkillsValues(
  draft: Resume,
  values: SkillsFormValues,
): void {
  const section = sectionOfType(draft, "skills");
  if (!section) return;
  section.entries = values.skills.map((item, index) => ({
    id: entryId(section, index),
    fields: { name: plain(item.name), level: plain(item.level) },
  }));
}

// --- Certifications (repeating: name, issuer, url) --------------------------

export function certificationEntries(resume: Resume): Entry[] {
  return sectionOfType(resume, "certifications")?.entries ?? [];
}

export function toCertificationsValues(
  resume: Resume,
): CertificationsFormValues {
  return {
    certifications: certificationEntries(resume).map((entry) => ({
      name: plainValue(entry.fields.name),
      issuer: plainValue(entry.fields.issuer),
      url: plainValue(entry.fields.url),
    })),
  };
}

export function applyCertificationsValues(
  draft: Resume,
  values: CertificationsFormValues,
): void {
  const section = sectionOfType(draft, "certifications");
  if (!section) return;
  section.entries = values.certifications.map((item, index) => ({
    id: entryId(section, index),
    fields: {
      name: plain(item.name),
      issuer: plain(item.issuer),
      url: plain(item.url),
    },
  }));
}

// --- Languages (repeating: name + proficiency level) -----------------------

export function languageEntries(resume: Resume): Entry[] {
  return sectionOfType(resume, "languages")?.entries ?? [];
}

export function toLanguagesValues(resume: Resume): LanguagesFormValues {
  return {
    languages: languageEntries(resume).map((entry) => ({
      name: plainValue(entry.fields.name),
      level: plainValue(entry.fields.level),
    })),
  };
}

export function applyLanguagesValues(
  draft: Resume,
  values: LanguagesFormValues,
): void {
  const section = sectionOfType(draft, "languages");
  if (!section) return;
  section.entries = values.languages.map((item, index) => ({
    id: entryId(section, index),
    fields: { name: plain(item.name), level: plain(item.level) },
  }));
}
