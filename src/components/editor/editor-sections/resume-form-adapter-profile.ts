import { A, O, pipe } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import {
  emptyRichTextValue,
  updateSectionById,
  updateSections,
} from "@/lib/resume";
import type { Entry, Resume } from "@/lib/resume/types";
import {
  plain,
  plainValue,
  rich,
  richValue,
  sectionOfType,
} from "./resume-form-adapter-shared";

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
