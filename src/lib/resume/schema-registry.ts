import type { CustomVariant, FieldKey, SectionType } from "./types";

/**
 * The allowed TipTap features for a richtext Field: the Restricted schema
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
 * Not part of the Section registry; the Header is not a Section.
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
  {
    key: "linkedin",
    label: "LinkedIn",
    kind: "plain",
    placeholder: "johndoe",
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
  internship: {
    type: "internship",
    defaultTitle: "Internship",
    singleton: false,
    fields: [
      {
        key: "title",
        label: "Role",
        kind: "plain",
        placeholder: "Frontend Engineering Intern",
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
  projects: {
    type: "projects",
    defaultTitle: "Projects",
    singleton: false,
    fields: [
      {
        key: "title",
        label: "Project name",
        kind: "plain",
        placeholder: "react-a11y-kit",
      },
      {
        key: "company",
        label: "Role",
        kind: "plain",
        placeholder: "Maintainer",
      },
      {
        key: "website",
        label: "Project URL",
        kind: "plain",
        placeholder: "github.com/you/project",
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
  organizations: {
    type: "organizations",
    defaultTitle: "Organizations",
    singleton: false,
    fields: [
      {
        key: "role",
        label: "Role",
        kind: "plain",
        placeholder: "Head of Public Relations",
      },
      {
        key: "organization",
        label: "Organization",
        kind: "plain",
        placeholder: "Student Executive Board",
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
  // A custom Section's Field shape depends on its `variant`; the registry lists
  // the `rich` (default) fields. Use `getCustomFields(variant)` for the actual
  // per-entry shape and `CUSTOM_LIST_FIELDS` for the `list` variant.
  custom: {
    type: "custom",
    defaultTitle: "Custom Section",
    singleton: false,
    fields: [
      {
        key: "body",
        label: "Body",
        kind: "richtext",
        features: PROSE_FEATURES,
      },
    ],
  },
};

/** The per-entry Field shape of a `list`-variant custom Section (experience-like). */
export const CUSTOM_LIST_FIELDS: FieldSchema[] = [
  { key: "title", label: "Title", kind: "plain", placeholder: "Award name" },
  {
    key: "subtitle",
    label: "Subtitle",
    kind: "plain",
    placeholder: "Issuer or place",
  },
  {
    key: "startDate",
    label: "Start date",
    kind: "plain",
    placeholder: "Jan 2023",
  },
  { key: "endDate", label: "End date", kind: "plain", placeholder: "Present" },
  {
    key: "description",
    label: "Description",
    kind: "richtext",
    features: PROSE_FEATURES,
  },
];

/** The per-entry Field shape for a custom Section in the given variant. */
export function getCustomFields(variant: CustomVariant): FieldSchema[] {
  return variant === "list"
    ? CUSTOM_LIST_FIELDS
    : SECTION_REGISTRY.custom.fields;
}

export function getSectionSchema(type: SectionType): SectionSchema {
  return SECTION_REGISTRY[type];
}

/**
 * The canonical reading order of every Section type, Summary first. This is the
 * order a freshly created document is authored in and the order the migration
 * ladder normalizes existing documents to, so that switching the render pipeline
 * from a hardcoded sequence to a data-driven one (driven by `sections[]` order)
 * is a visual no-op until the user reorders. `custom` is appended last.
 */
export const CANONICAL_SECTION_ORDER: SectionType[] = [
  "summary",
  "experience",
  "internship",
  "projects",
  "organizations",
  "education",
  "certifications",
  "skills",
  "languages",
  "custom",
];

/**
 * Section types the user can drag to reorder. Summary is pinned directly below
 * the Header (which is not a Section at all), so neither participates in
 * reordering; every other type does, in `CANONICAL_SECTION_ORDER` order.
 */
export type ReorderableSectionType = Exclude<SectionType, "summary">;

export const REORDERABLE_SECTION_TYPES: ReorderableSectionType[] =
  CANONICAL_SECTION_ORDER.filter(
    (type): type is ReorderableSectionType => type !== "summary",
  );

const REORDERABLE_SECTION_SET = new Set<SectionType>(REORDERABLE_SECTION_TYPES);

export function isReorderableSection(type: SectionType): boolean {
  return REORDERABLE_SECTION_SET.has(type);
}

/** Sort key for a Section type; unknown types sort last, preserving their order. */
export function canonicalSectionIndex(type: string): number {
  const index = CANONICAL_SECTION_ORDER.indexOf(type as SectionType);
  return index === -1 ? CANONICAL_SECTION_ORDER.length : index;
}
