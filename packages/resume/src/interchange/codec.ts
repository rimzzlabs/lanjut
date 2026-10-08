import { A, D, F, O, pipe, S } from "@mobily/ts-belt";
import {
  CANONICAL_SECTION_ORDER,
  CUSTOM_LIST_FIELDS,
  createCustomEntry,
  createCustomSection,
  createEmptyEntry,
  createEmptyHeader,
  createEmptySection,
  type Entry,
  type Field,
  type FieldSchema,
  getSectionSchema,
  HEADER_SCHEMA,
  type Header,
  type Resume,
  type ResumeLanguage,
  type Section,
} from "..";
import { markdownToTiptap, tiptapToMarkdown } from "./markdown";
import {
  INTERCHANGE_FORMAT,
  INTERCHANGE_VERSION,
  type InterchangeResume,
  type InterchangeSection,
} from "./schema";

/** The slice of a Resume the interchange round-trips; ids and timestamps stay out. */
export interface ResumeContent {
  title?: string;
  templateId?: string;
  language?: ResumeLanguage;
  showIcons?: boolean;
  sectionSpacing?: number;
  font?: string;
  letterSpacing?: number;
  lineHeight?: number;
  nameScale?: number;
  titleScale?: number;
  bodyScale?: number;
  photoSize?: number;
  photoRadius?: number;
  photoAlign?: "top" | "center" | "bottom";
  header: Header;
  sections: ReadonlyArray<Section>;
}

// --- Resume -> interchange -------------------------------------------------

function fieldToString(field: Field | undefined): string {
  if (!field) return "";
  if (field.kind === "plain") return field.value;
  return tiptapToMarkdown(field.value);
}

function firstBodyString(section: Section): string {
  return pipe(
    section.entries,
    A.head,
    O.mapWithDefault("", (entry) => fieldToString(entry.fields.body)),
  );
}

function entryToValues(
  entry: Entry | undefined,
  fields: FieldSchema[],
): Record<string, string> {
  return pipe(
    fields,
    A.map((field): readonly [string, string] => [
      field.key,
      fieldToString(entry?.fields[field.key]),
    ]),
    D.fromPairs,
  );
}

function sectionToInterchange(section: Section): InterchangeSection {
  if (section.type === "summary") {
    return {
      type: "summary",
      title: section.title,
      hidden: section.hidden ?? false,
      body: firstBodyString(section),
    };
  }
  if (section.type === "custom") {
    const variant = section.variant ?? "rich";
    if (variant === "rich") {
      return {
        type: "custom",
        variant,
        title: section.title,
        hidden: section.hidden ?? false,
        body: firstBodyString(section),
      };
    }
    return {
      type: "custom",
      variant,
      title: section.title,
      hidden: section.hidden ?? false,
      entries: F.toMutable(
        A.map(section.entries, (entry) =>
          entryToValues(entry, CUSTOM_LIST_FIELDS),
        ),
      ),
    };
  }
  const fields = getSectionSchema(section.type).fields;
  const base = {
    type: section.type,
    title: section.title,
    hidden: section.hidden ?? false,
    entries: F.toMutable(
      A.map(section.entries, (entry) => entryToValues(entry, fields)),
    ),
  };
  if (section.type === "skills" || section.type === "languages") {
    return {
      ...base,
      type: section.type,
      columns: section.columns ?? 2,
      showProficiency: section.showProficiency ?? true,
    };
  }
  return base as InterchangeSection;
}

export function resumeToInterchange(resume: Resume): InterchangeResume {
  const header = pipe(
    HEADER_SCHEMA,
    A.map((field): readonly [string, string] => [
      field.key,
      fieldToString(resume.header.fields[field.key]),
    ]),
    D.fromPairs,
  );
  return {
    format: INTERCHANGE_FORMAT,
    version: INTERCHANGE_VERSION,
    title: resume.title,
    template: resume.templateId,
    language: resume.language,
    showIcons: resume.showIcons ?? true,
    sectionSpacing: resume.sectionSpacing ?? 0,
    font: resume.font,
    letterSpacing: resume.letterSpacing ?? 0,
    lineHeight: resume.lineHeight,
    nameScale: resume.nameScale,
    titleScale: resume.titleScale,
    bodyScale: resume.bodyScale,
    header,
    photo: resume.header.photo,
    photoSize: resume.photoSize,
    photoRadius: resume.photoRadius,
    photoAlign: resume.photoAlign,
    sections: F.toMutable(A.map(resume.sections, sectionToInterchange)),
  };
}

// --- interchange -> Resume content -----------------------------------------

function fieldFromValue(field: FieldSchema, value: string): Field {
  if (field.kind === "plain") return { kind: "plain", value: S.trim(value) };
  return { kind: "richtext", value: markdownToTiptap(value) };
}

interface FillEntryParams {
  entry: Entry;
  fields: FieldSchema[];
  values: Record<string, string | undefined>;
}

function fillEntry(params: FillEntryParams): Entry {
  const { entry, fields, values } = params;
  const filled = A.reduce(fields, entry.fields, (acc, field) => {
    const value = values[field.key];
    if (value === undefined) return acc;
    return D.set(acc, field.key, fieldFromValue(field, value));
  });
  return { ...entry, fields: filled };
}

function emptyBodyEntry(type: "summary" | "custom"): Entry {
  if (type === "custom") return createCustomEntry("rich");
  return createEmptyEntry(type);
}

function bodyEntry(type: "summary" | "custom", body: string): Entry {
  const entry = emptyBodyEntry(type);
  const value = markdownToTiptap(body);
  return {
    ...entry,
    fields: { ...entry.fields, body: { kind: "richtext", value } },
  };
}

function withTitle(section: Section, title: string | undefined): Section {
  if (!title) return section;
  return { ...section, title };
}

function withHidden(section: Section, hidden: boolean | undefined): Section {
  if (hidden === undefined) return section;
  return { ...section, hidden };
}

function withBody(
  section: Section,
  body: { type: "summary" | "custom"; value: string | undefined },
): Section {
  if (body.value === undefined) return section;
  return { ...section, entries: [bodyEntry(body.type, body.value)] };
}

/** Copies the grid toggles that Skills and Languages carry, when present. */
function withGridSettings(section: Section, item: InterchangeSection): Section {
  const columns = "columns" in item ? item.columns : undefined;
  const showProficiency =
    "showProficiency" in item ? item.showProficiency : undefined;
  return {
    ...section,
    ...(columns !== undefined && { columns }),
    ...(showProficiency !== undefined && { showProficiency }),
  };
}

function interchangeToSection(item: InterchangeSection): Section {
  if (item.type === "summary") {
    const section = pipe(
      createEmptySection("summary"),
      (current) => withTitle(current, item.title),
      (current) => withHidden(current, item.hidden),
    );
    return withBody(section, { type: "summary", value: item.body });
  }
  if (item.type === "custom") {
    const variant = item.variant ?? "rich";
    const section = withHidden(
      createCustomSection(variant, item.title || undefined),
      item.hidden,
    );
    if (variant === "rich") {
      return withBody(section, { type: "custom", value: item.body });
    }
    const entries = A.map(item.entries ?? [], (values) =>
      fillEntry({
        entry: createCustomEntry("list"),
        fields: CUSTOM_LIST_FIELDS,
        values,
      }),
    );
    return { ...section, entries };
  }
  const section = pipe(
    createEmptySection(item.type),
    (current) => withTitle(current, item.title),
    (current) => withHidden(current, item.hidden),
  );
  const fields = getSectionSchema(item.type).fields;
  const entries = A.map(item.entries ?? [], (values) =>
    fillEntry({ entry: createEmptyEntry(item.type), fields, values }),
  );
  return withGridSettings({ ...section, entries }, item);
}

function withPhoto(header: Header, photo: string | undefined): Header {
  if (!photo) return header;
  return { ...header, photo };
}

/** Summary first, then the provided sections, then any missing core section. */
function completeSections(
  provided: ReadonlyArray<Section>,
): ReadonlyArray<Section> {
  const summary = A.find(provided, (section) => section.type === "summary");
  const ordered = A.concat(
    [O.getWithDefault(summary, createEmptySection("summary"))],
    A.reject(provided, (section) => section.type === "summary"),
  );
  return A.reduce(CANONICAL_SECTION_ORDER, ordered, (sections, type) => {
    if (type === "custom") return sections;
    if (A.some(sections, (section) => section.type === type)) return sections;
    return A.append(sections, createEmptySection(type));
  });
}

export function interchangeToContent(data: InterchangeResume): ResumeContent {
  const empty = createEmptyHeader();
  const fields = A.reduce(HEADER_SCHEMA, empty.fields, (acc, field) => {
    const value = data.header?.[field.key];
    if (value === undefined) return acc;
    return D.set(acc, field.key, { kind: "plain", value: S.trim(value) });
  });
  const header = withPhoto({ ...empty, fields }, data.photo);

  // Summary is pinned first; core sections the document omits are appended
  // empty so the editor always has its full fixed set.
  const sections = completeSections(
    A.map(data.sections ?? [], interchangeToSection),
  );

  return {
    title: S.trim(data.title ?? "") || undefined,
    templateId: data.template,
    language: data.language,
    showIcons: data.showIcons,
    sectionSpacing: data.sectionSpacing,
    font: data.font,
    letterSpacing: data.letterSpacing,
    lineHeight: data.lineHeight,
    nameScale: data.nameScale,
    titleScale: data.titleScale,
    bodyScale: data.bodyScale,
    photoSize: data.photoSize,
    photoRadius: data.photoRadius,
    photoAlign: data.photoAlign,
    header,
    sections,
  };
}
