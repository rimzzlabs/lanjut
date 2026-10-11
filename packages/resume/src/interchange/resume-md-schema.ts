import { A, D, O, pipe, S } from "@mobily/ts-belt";
import {
  CUSTOM_LIST_FIELDS,
  type CustomVariant,
  type FieldSchema,
  HEADER_SCHEMA,
  RESUME_LABELS,
  SECTION_REGISTRY,
  type SectionType,
} from "..";

// The rules that the Markdown form of a résumé shares between its writer and
// its reader. docs/markdown-dialect.md describes them for people.

export type EntrySectionType = Exclude<SectionType, "summary">;

/** The field that an entry writes as its `###` heading. */
const HEADING_FIELD: Record<EntrySectionType, string> = {
  experience: "title",
  internship: "title",
  projects: "title",
  organizations: "role",
  education: "institution",
  certifications: "name",
  skills: "name",
  languages: "name",
  custom: "title",
};

/** Stands for an entry with no title, because comark drops an empty heading. */
export const EMPTY_HEADING = "-";

export const DATES_LABEL = "Dates";
export const DATES_SEPARATOR = " - ";
const DATES_SPLIT = / [-–—] /;

function fieldsOf(type: EntrySectionType): ReadonlyArray<FieldSchema> {
  if (type === "custom") return CUSTOM_LIST_FIELDS;
  return SECTION_REGISTRY[type].fields;
}

export interface EntryShape {
  headingKey: string;
  headingLabel: string;
  /** The plain fields under the heading, in registry order. */
  plain: ReadonlyArray<FieldSchema>;
  bodyKey: string | undefined;
  hasDates: boolean;
}

export function entryShape(type: EntrySectionType): EntryShape {
  const fields = fieldsOf(type);
  const headingKey = HEADING_FIELD[type];
  const heading = A.find(fields, (field) => field.key === headingKey);
  const plain = A.filter(
    fields,
    (field) => field.kind === "plain" && field.key !== headingKey,
  );
  const body = A.find(fields, (field) => field.kind === "richtext");
  return {
    headingKey,
    headingLabel: O.mapWithDefault(heading, headingKey, (field) => field.label),
    plain,
    bodyKey: O.toUndefined(O.map(body, (field) => field.key)),
    hasDates: A.some(plain, (field) => field.key === "startDate"),
  };
}

export function isGridSection(
  type: SectionType,
): type is "skills" | "languages" {
  return type === "skills" || type === "languages";
}

export function normalizeLabel(label: string): string {
  return pipe(label, S.trim, S.toLowerCase, S.replaceByRe(/\s+/g, " "));
}

/** A normalized label to its field key. A Map, so no label finds `constructor`. */
export type LabelTable = ReadonlyMap<string, string>;

/** A field answers to its registry label and to its own key. */
function labelTable(fields: ReadonlyArray<FieldSchema>): LabelTable {
  const plain = A.filter(fields, (field) => field.kind === "plain");
  return new Map(
    A.concat(
      A.map(plain, (field) => [normalizeLabel(field.key), field.key] as const),
      A.map(
        plain,
        (field) => [normalizeLabel(field.label), field.key] as const,
      ),
    ),
  );
}

export const HEADER_LABELS: LabelTable = labelTable(HEADER_SCHEMA);

export function entryLabels(type: EntrySectionType): LabelTable {
  return labelTable(fieldsOf(type));
}

const LABEL_LINE = /^([^:]{1,40}):(?:\s+(.*))?$/;

export interface LabelLine {
  label: string;
  value: string;
}

/** `Company: Acme` as its two parts, or nothing when the line has another shape. */
export function readLabelLine(line: string): LabelLine | undefined {
  const match = LABEL_LINE.exec(S.trim(line));
  if (!match) return undefined;
  const [, label = "", value = ""] = match;
  return { label: normalizeLabel(label), value: S.trim(value) };
}

export function isDatesLabel(label: string): boolean {
  return label === normalizeLabel(DATES_LABEL);
}

const ALL_LABELS = new Set<string>([
  normalizeLabel(DATES_LABEL),
  ...HEADER_LABELS.keys(),
  ...A.flatMap(D.keys(HEADING_FIELD), (type) => [...entryLabels(type).keys()]),
]);

/** True for a label of any section. The syntax colors use it. */
export function isKnownLabel(label: string): boolean {
  return ALL_LABELS.has(normalizeLabel(label));
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function splitDates(value: string): DateRange {
  const match = DATES_SPLIT.exec(value);
  if (!match) return { startDate: S.trim(value), endDate: "" };
  return {
    startDate: S.trim(S.slice(value, 0, match.index)),
    endDate: S.trim(S.sliceToEnd(value, match.index + S.length(match[0]))),
  };
}

/** One `Dates:` line reads back as these two dates. If not, each date takes its own line. */
export function canJoinDates(range: DateRange): boolean {
  if (S.isEmpty(range.startDate) || S.isEmpty(range.endDate)) return false;
  return !DATES_SPLIT.test(range.startDate);
}

type CoreType = Exclude<SectionType, "custom">;

const SECTION_TYPES = D.keys(SECTION_REGISTRY);

function coreTitles(type: CoreType): ReadonlyArray<string> {
  const labelKey = type === "certifications" ? "certificates" : type;
  return A.concat(
    [SECTION_REGISTRY[type].defaultTitle],
    A.map(D.values(RESUME_LABELS), (labels) => labels[labelKey]),
  );
}

/** A core section answers to its default title and to its label in each résumé language. */
const TITLE_TYPES: ReadonlyMap<string, CoreType> = new Map(
  pipe(
    SECTION_TYPES,
    A.filter((type): type is CoreType => type !== "custom"),
    A.flatMap((type) =>
      A.map(
        coreTitles(type),
        (title) => [normalizeLabel(title), type] as const,
      ),
    ),
  ),
);

export function typeOfTitle(title: string): CoreType | undefined {
  return TITLE_TYPES.get(normalizeLabel(title));
}

function isSectionType(value: string): value is SectionType {
  return A.includes<string>(SECTION_TYPES, value);
}

function isVariant(value: string): value is CustomVariant {
  return value === "rich" || value === "list";
}

export interface HeadingAttributes {
  type?: SectionType;
  variant?: CustomVariant;
}

export interface SectionHeading extends HeadingAttributes {
  title: string;
}

const HEADING_BRACES = /^(.*?)\s*\{([^{}]*)\}$/;
const ATTRIBUTE = /^(type|variant)=("?)([a-z]+)\2$/;

function readAttribute(word: string): HeadingAttributes | undefined {
  const [, name, , value = ""] = ATTRIBUTE.exec(word) ?? [];
  if (name === "type" && isSectionType(value)) return { type: value };
  if (name === "variant" && isVariant(value)) return { variant: value };
  return undefined;
}

/**
 * `Work History {type=experience}` as its title and attributes. The braces
 * are attributes only when each word in them is a `type` or a `variant` that
 * exists. Any other braces stay in the title.
 */
export function readSectionHeading(text: string): SectionHeading {
  const whole = S.trim(text);
  const [, title = "", braces = ""] = HEADING_BRACES.exec(whole) ?? [];
  const words = pipe(
    braces,
    S.trim,
    S.splitByRe(/\s+/),
    A.filter((word): word is string => Boolean(word)),
  );
  const attributes = A.map(words, readAttribute);
  if (A.isEmpty(words) || A.some(attributes, (item) => item === undefined)) {
    return { title: whole };
  }
  const start: SectionHeading = { title: S.trim(title) };
  return A.reduce(attributes, start, (heading, item) => ({
    ...heading,
    ...item,
  }));
}

export function writeHeadingAttributes(attributes: HeadingAttributes): string {
  const words = A.filter(
    [
      attributes.type && `type=${attributes.type}`,
      attributes.variant && `variant=${attributes.variant}`,
    ],
    (word): word is string => Boolean(word),
  );
  if (A.isEmpty(words)) return "";
  return ` {${A.join(words, " ")}}`;
}

export interface PersonName {
  firstName: string;
  lastName: string;
}

/**
 * The `#` heading holds the whole name. The last word is the last name, and
 * one word alone is the first name. A name that splits another way writes
 * its `First name` and `Last name` lines.
 */
export function splitName(name: string): PersonName {
  const whole = S.trim(name);
  return O.mapWithDefault(
    S.lastIndexOf(whole, " "),
    { firstName: whole, lastName: "" },
    (cut) => ({
      firstName: S.trim(S.slice(whole, 0, cut)),
      lastName: S.sliceToEnd(whole, cut + 1),
    }),
  );
}
