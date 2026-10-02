import { A, F, O, pipe } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import {
  emptyRichTextValue,
  updateSectionById,
  updateSections,
} from "@/lib/resume";
import type { Entry, Field, Resume, Section } from "@/lib/resume/types";
import { byRecency } from "../resume-sort";

export interface PersonalFormValues {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  link: string;
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
  location: string;
  companyContext: string;
  website: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface ExperienceFormValues {
  experiences: ExperienceItemValues[];
}

export interface InternshipItemValues {
  title: string;
  company: string;
  location: string;
  companyContext: string;
  website: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface InternshipFormValues {
  internships: InternshipItemValues[];
}

export interface ProjectItemValues {
  title: string;
  company: string;
  website: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface ProjectsFormValues {
  projects: ProjectItemValues[];
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
): O.Option<Section> {
  return A.find(resume.sections, (section) => section.type === type);
}

/**
 * Keep entry ids stable across form-driven rebuilds by reusing the existing
 * entry's id at the same index. Regenerating ids on every keystroke invalidates
 * everything keyed by them downstream, most visibly the preview's measured
 * block heights, which collapsed pagination to a single page.
 */
function entryId(section: Section, index: number): string {
  return O.match(
    A.get(section.entries, index),
    (entry) => entry.id,
    () => nanoid(),
  );
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
    linkedin: plainValue(fields.linkedin),
    link: plainValue(fields.link),
    city: plainValue(fields.city),
    province: plainValue(fields.province),
    country: plainValue(fields.country),
  };
}

export function applyPersonalValues(
  resume: Resume,
  values: PersonalFormValues,
): Resume {
  return {
    ...resume,
    header: {
      ...resume.header,
      fields: {
        ...resume.header.fields,
        firstName: plain(values.firstName),
        lastName: plain(values.lastName),
        jobTitle: plain(values.jobTitle),
        email: plain(values.email),
        phone: plain(values.phone),
        website: plain(values.website),
        linkedin: plain(values.linkedin),
        link: plain(values.link),
        city: plain(values.city),
        province: plain(values.province),
        country: plain(values.country),
      },
    },
  };
}

// --- Summary (singleton section, single rich-text body) --------------------

export function toSummaryValues(resume: Resume): SummaryFormValues {
  const summary = pipe(
    sectionOfType(resume, "summary"),
    O.flatMap((section) => A.head(section.entries)),
    O.mapWithDefault(emptyRichTextValue(), (entry) =>
      richValue(entry.fields.body),
    ),
  );
  return { summary };
}

export function applySummaryValues(
  resume: Resume,
  values: SummaryFormValues,
): Resume {
  const section = sectionOfType(resume, "summary");
  if (O.isNone(section)) return resume;
  const body = rich(values.summary);
  const entries = O.match(
    A.head(section.entries),
    (entry) =>
      A.replaceAt(section.entries, 0, {
        ...entry,
        fields: { ...entry.fields, body },
      }),
    (): ReadonlyArray<Entry> => [{ id: nanoid(), fields: { body } }],
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Experience (repeating section entries) --------------------------------

export function experienceEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "experience"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toExperienceValues(resume: Resume): ExperienceFormValues {
  return {
    experiences: pipe(
      experienceEntries(resume),
      A.map((entry) => ({
        title: plainValue(entry.fields.title),
        company: plainValue(entry.fields.company),
        location: plainValue(entry.fields.location),
        companyContext: plainValue(entry.fields.companyContext),
        website: plainValue(entry.fields.website),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        description: richValue(entry.fields.description),
      })),
      A.sort(byRecency),
      // react-hook-form edits field arrays in place.
      F.toMutable,
    ),
  };
}

export function applyExperienceValues(
  resume: Resume,
  values: ExperienceFormValues,
): Resume {
  const section = sectionOfType(resume, "experience");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.experiences,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: {
        title: plain(item.title),
        company: plain(item.company),
        location: plain(item.location),
        companyContext: plain(item.companyContext),
        website: plain(item.website),
        startDate: plain(item.startDate),
        endDate: plain(item.endDate),
        description: rich(item.description),
      },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Internship (repeating section entries) ---------------------------------

export function internshipEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "internship"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toInternshipValues(resume: Resume): InternshipFormValues {
  return {
    internships: pipe(
      internshipEntries(resume),
      A.map((entry) => ({
        title: plainValue(entry.fields.title),
        company: plainValue(entry.fields.company),
        location: plainValue(entry.fields.location),
        companyContext: plainValue(entry.fields.companyContext),
        website: plainValue(entry.fields.website),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        description: richValue(entry.fields.description),
      })),
      A.sort(byRecency),
      F.toMutable,
    ),
  };
}

export function applyInternshipValues(
  resume: Resume,
  values: InternshipFormValues,
): Resume {
  const section = sectionOfType(resume, "internship");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.internships,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: {
        title: plain(item.title),
        company: plain(item.company),
        location: plain(item.location),
        companyContext: plain(item.companyContext),
        website: plain(item.website),
        startDate: plain(item.startDate),
        endDate: plain(item.endDate),
        description: rich(item.description),
      },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Projects (repeating section entries) -----------------------------------

export function projectEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "projects"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toProjectsValues(resume: Resume): ProjectsFormValues {
  return {
    projects: pipe(
      projectEntries(resume),
      A.map((entry) => ({
        title: plainValue(entry.fields.title),
        company: plainValue(entry.fields.company),
        website: plainValue(entry.fields.website),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        description: richValue(entry.fields.description),
      })),
      A.sort(byRecency),
      F.toMutable,
    ),
  };
}

export function applyProjectsValues(
  resume: Resume,
  values: ProjectsFormValues,
): Resume {
  const section = sectionOfType(resume, "projects");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.projects,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: {
        title: plain(item.title),
        company: plain(item.company),
        website: plain(item.website),
        startDate: plain(item.startDate),
        endDate: plain(item.endDate),
        description: rich(item.description),
      },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Organizations (repeating section entries) ------------------------------

export function organizationEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "organizations"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toOrganizationsValues(resume: Resume): OrganizationsFormValues {
  return {
    organizations: pipe(
      organizationEntries(resume),
      A.map((entry) => ({
        role: plainValue(entry.fields.role),
        organization: plainValue(entry.fields.organization),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        description: richValue(entry.fields.description),
      })),
      A.sort(byRecency),
      F.toMutable,
    ),
  };
}

export function applyOrganizationsValues(
  resume: Resume,
  values: OrganizationsFormValues,
): Resume {
  const section = sectionOfType(resume, "organizations");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.organizations,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: {
        role: plain(item.role),
        organization: plain(item.organization),
        startDate: plain(item.startDate),
        endDate: plain(item.endDate),
        description: rich(item.description),
      },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Education (repeating section entries) ----------------------------------

export function educationEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "education"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toEducationValues(resume: Resume): EducationFormValues {
  return {
    educations: pipe(
      educationEntries(resume),
      A.map((entry) => ({
        institution: plainValue(entry.fields.institution),
        degree: plainValue(entry.fields.degree),
        location: plainValue(entry.fields.location),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        details: richValue(entry.fields.details),
      })),
      A.sort(byRecency),
      F.toMutable,
    ),
  };
}

export function applyEducationValues(
  resume: Resume,
  values: EducationFormValues,
): Resume {
  const section = sectionOfType(resume, "education");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.educations,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: {
        institution: plain(item.institution),
        degree: plain(item.degree),
        location: plain(item.location),
        startDate: plain(item.startDate),
        endDate: plain(item.endDate),
        details: rich(item.details),
      },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Skills (repeating section, one plain name per skill) -------------------

export function skillsEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "skills"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toSkillsValues(resume: Resume): SkillsFormValues {
  return {
    skills: pipe(
      skillsEntries(resume),
      A.map((entry) => ({
        name: plainValue(entry.fields.name),
        level: plainValue(entry.fields.level),
      })),
      F.toMutable,
    ),
  };
}

export function applySkillsValues(
  resume: Resume,
  values: SkillsFormValues,
): Resume {
  const section = sectionOfType(resume, "skills");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.skills,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: { name: plain(item.name), level: plain(item.level) },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Certifications (repeating: name, issuer, url) --------------------------

export function certificationEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "certifications"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toCertificationsValues(
  resume: Resume,
): CertificationsFormValues {
  return {
    certifications: pipe(
      certificationEntries(resume),
      A.map((entry) => ({
        name: plainValue(entry.fields.name),
        issuer: plainValue(entry.fields.issuer),
        url: plainValue(entry.fields.url),
      })),
      F.toMutable,
    ),
  };
}

export function applyCertificationsValues(
  resume: Resume,
  values: CertificationsFormValues,
): Resume {
  const section = sectionOfType(resume, "certifications");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.certifications,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: {
        name: plain(item.name),
        issuer: plain(item.issuer),
        url: plain(item.url),
      },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Languages (repeating: name + proficiency level) -----------------------

export function languageEntries(resume: Resume): ReadonlyArray<Entry> {
  return pipe(
    sectionOfType(resume, "languages"),
    O.mapWithDefault([], (section) => section.entries),
  );
}

export function toLanguagesValues(resume: Resume): LanguagesFormValues {
  return {
    languages: pipe(
      languageEntries(resume),
      A.map((entry) => ({
        name: plainValue(entry.fields.name),
        level: plainValue(entry.fields.level),
      })),
      F.toMutable,
    ),
  };
}

export function applyLanguagesValues(
  resume: Resume,
  values: LanguagesFormValues,
): Resume {
  const section = sectionOfType(resume, "languages");
  if (O.isNone(section)) return resume;
  const entries = pipe(
    values.languages,
    A.mapWithIndex((index, item) => ({
      id: entryId(section, index),
      fields: { name: plain(item.name), level: plain(item.level) },
    })),
  );
  return updateSections(
    resume,
    updateSectionById(section.id, (current) => ({ ...current, entries })),
  );
}

// --- Custom sections (addressed by id; shape depends on the variant) --------

function sectionById(resume: Resume, id: string): O.Option<Section> {
  return A.find(resume.sections, (section) => section.id === id);
}

export interface CustomBodyFormValues {
  body: JSONContent;
}

export function toCustomBodyValues(section: Section): CustomBodyFormValues {
  const body = pipe(
    A.head(section.entries),
    O.mapWithDefault(emptyRichTextValue(), (entry) =>
      richValue(entry.fields.body),
    ),
  );
  return { body };
}

// The section title is managed outside the form (add/rename dialogs), so these
// adapters only own the content and never touch `section.title`.
/** Data-last: pass the result straight to `updateOpen`. */
export function applyCustomBodyValues(
  id: string,
  values: CustomBodyFormValues,
): (resume: Resume) => Resume {
  return (resume) => {
    const section = sectionById(resume, id);
    if (O.isNone(section) || section.type !== "custom") return resume;
    const entries = [
      { id: entryId(section, 0), fields: { body: rich(values.body) } },
    ];
    return updateSections(
      resume,
      updateSectionById(section.id, (current) => ({ ...current, entries })),
    );
  };
}

export interface CustomListItemValues {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface CustomListFormValues {
  entries: CustomListItemValues[];
}

export function toCustomListValues(section: Section): CustomListFormValues {
  return {
    entries: pipe(
      section.entries,
      A.map((entry) => ({
        title: plainValue(entry.fields.title),
        subtitle: plainValue(entry.fields.subtitle),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        description: richValue(entry.fields.description),
      })),
      F.toMutable,
    ),
  };
}

/** Data-last: pass the result straight to `updateOpen`. */
export function applyCustomListValues(
  id: string,
  values: CustomListFormValues,
): (resume: Resume) => Resume {
  return (resume) => {
    const section = sectionById(resume, id);
    if (O.isNone(section) || section.type !== "custom") return resume;
    const entries = pipe(
      values.entries,
      A.mapWithIndex((index, item) => ({
        id: entryId(section, index),
        fields: {
          title: plain(item.title),
          subtitle: plain(item.subtitle),
          startDate: plain(item.startDate),
          endDate: plain(item.endDate),
          description: rich(item.description),
        },
      })),
    );
    return updateSections(
      resume,
      updateSectionById(section.id, (current) => ({ ...current, entries })),
    );
  };
}
