import type { FieldKey, SectionType } from "./types";

/**
 * The allowed TipTap features for a richtext Field — the Restricted schema
 * allowlist. Base document/paragraph/text are always implied. Both typing and
 * paste are filtered through this list so disallowed structure (tables, headings,
 * images) cannot be represented or pasted in.
 */
export type RichTextFeature =
  | "bold"
  | "italic"
  | "bulletList"
  | "orderedList"
  | "link";

interface PlainFieldSchema {
  key: FieldKey;
  label: string;
  kind: "plain";
  placeholder?: string;
}

interface RichTextFieldSchema {
  key: FieldKey;
  label: string;
  kind: "richtext";
  features: RichTextFeature[];
}

export type FieldSchema = PlainFieldSchema | RichTextFieldSchema;

export interface SectionSchema {
  type: SectionType;
  defaultTitle: string;
  /** Singleton sections (summary, skills) hold exactly one Entry; others repeat. */
  singleton: boolean;
  /** The Field shape of every Entry in this Section. */
  fields: FieldSchema[];
}

/** The default richtext allowlist shared by most body fields. */
export const PROSE_FEATURES: RichTextFeature[] = [
  "bold",
  "italic",
  "bulletList",
  "orderedList",
  "link",
];

/**
 * The privileged Header's Field shape. Identity and contact information only.
 * Not part of the Section registry — the Header is not a Section.
 */
export const HEADER_SCHEMA: FieldSchema[] = [
  {
    key: "firstName",
    label: "First name",
    kind: "plain",
    placeholder: "John",
  },
  { key: "lastName", label: "Last name", kind: "plain", placeholder: "Doe" },
  {
    key: "jobTitle",
    label: "Job title",
    kind: "plain",
    placeholder: "Senior Frontend Engineer",
  },
  { key: "email", label: "Email", kind: "plain", placeholder: "john@doe.dev" },
  {
    key: "phone",
    label: "Phone",
    kind: "plain",
    placeholder: "+1 555 010 1234",
  },
  {
    key: "website",
    label: "Website",
    kind: "plain",
    placeholder: "https://doe.dev",
  },
  { key: "city", label: "City", kind: "plain", placeholder: "San Francisco" },
  {
    key: "province",
    label: "Province",
    kind: "plain",
    placeholder: "California",
  },
  {
    key: "country",
    label: "Country",
    kind: "plain",
    placeholder: "United States",
  },
];

/**
 * The closed, code-defined set of Section types. Users add, reorder,
 * relabel, and fill Sections but can never define new Field structures. Adding a
 * type is a deliberate code change so parseability is answered before it ships.
 */
export const SECTION_REGISTRY: Record<SectionType, SectionSchema> = {
  summary: {
    type: "summary",
    defaultTitle: "Summary",
    singleton: true,
    fields: [
      {
        key: "body",
        label: "Summary",
        kind: "richtext",
        features: PROSE_FEATURES,
      },
    ],
  },
  experience: {
    type: "experience",
    defaultTitle: "Experience",
    singleton: false,
    fields: [
      {
        key: "title",
        label: "Job title",
        kind: "plain",
        placeholder: "Senior Engineer",
      },
      {
        key: "company",
        label: "Company",
        kind: "plain",
        placeholder: "Acme Inc.",
      },
      {
        key: "website",
        label: "Company website",
        kind: "plain",
        placeholder: "acme.com",
      },
      {
        key: "startDate",
        label: "Start date",
        kind: "plain",
        placeholder: "Jan 2023",
      },
      {
        key: "endDate",
        label: "End date",
        kind: "plain",
        placeholder: "Present",
      },
      {
        key: "description",
        label: "Description",
        kind: "richtext",
        features: PROSE_FEATURES,
      },
    ],
  },
  education: {
    type: "education",
    defaultTitle: "Education",
    singleton: false,
    fields: [
      {
        key: "institution",
        label: "Institution",
        kind: "plain",
        placeholder: "State University",
      },
      {
        key: "degree",
        label: "Degree",
        kind: "plain",
        placeholder: "B.Sc. Computer Science",
      },
      {
        key: "location",
        label: "Location",
        kind: "plain",
        placeholder: "Boston, MA",
      },
      {
        key: "startDate",
        label: "Start date",
        kind: "plain",
        placeholder: "2016",
      },
      { key: "endDate", label: "End date", kind: "plain", placeholder: "2020" },
      {
        key: "details",
        label: "Details",
        kind: "richtext",
        features: PROSE_FEATURES,
      },
    ],
  },
  skills: {
    type: "skills",
    defaultTitle: "Skills",
    singleton: false,
    fields: [
      { key: "name", label: "Skill", kind: "plain", placeholder: "TypeScript" },
      {
        key: "level",
        label: "Proficiency",
        kind: "plain",
        placeholder: "Advanced",
      },
    ],
  },
  certifications: {
    type: "certifications",
    defaultTitle: "Certifications",
    singleton: false,
    fields: [
      {
        key: "name",
        label: "Name",
        kind: "plain",
        placeholder: "AWS Certified Solutions Architect",
      },
      {
        key: "issuer",
        label: "Issuer",
        kind: "plain",
        placeholder: "Amazon Web Services",
      },
      {
        key: "url",
        label: "Certificate URL",
        kind: "plain",
        placeholder: "https://…",
      },
    ],
  },
  languages: {
    type: "languages",
    defaultTitle: "Languages",
    singleton: false,
    fields: [
      { key: "name", label: "Language", kind: "plain", placeholder: "English" },
      {
        key: "level",
        label: "Proficiency",
        kind: "plain",
        placeholder: "Fluent",
      },
    ],
  },
  custom: {
    type: "custom",
    defaultTitle: "Custom Section",
    singleton: false,
    fields: [
      {
        key: "title",
        label: "Title",
        kind: "plain",
        placeholder: "Certification",
      },
      {
        key: "body",
        label: "Body",
        kind: "richtext",
        features: PROSE_FEATURES,
      },
    ],
  },
};

export function getSectionSchema(type: SectionType): SectionSchema {
  return SECTION_REGISTRY[type];
}
