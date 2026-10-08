import { updateSectionById, updateSections } from "@lanjut/resume";
import type { Entry, Resume } from "@lanjut/resume/types";
import { A, F, O, pipe } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { byRecency } from "../resume-sort";
import {
  entryId,
  plain,
  plainValue,
  rich,
  richValue,
  sectionOfType,
} from "./resume-form-adapter-shared";

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
