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
} from "@/lib/resume";
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
  header: Header;
  sections: Section[];
}

// --- Resume -> interchange -------------------------------------------------

function fieldToString(field: Field | undefined): string {
  if (!field) return "";
  if (field.kind === "plain") return field.value;
  return tiptapToMarkdown(field.value);
}

function entryToValues(
  entry: Entry | undefined,
  fields: FieldSchema[],
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field.key] = fieldToString(entry?.fields[field.key]);
  }
  return values;
}

function sectionToInterchange(section: Section): InterchangeSection {
  if (section.type === "summary") {
    return {
      type: "summary",
      title: section.title,
      hidden: section.hidden ?? false,
      body: fieldToString(section.entries[0]?.fields.body),
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
        body: fieldToString(section.entries[0]?.fields.body),
      };
    }
    return {
      type: "custom",
      variant,
      title: section.title,
      hidden: section.hidden ?? false,
      entries: section.entries.map((entry) =>
        entryToValues(entry, CUSTOM_LIST_FIELDS),
      ),
    };
  }
  const fields = getSectionSchema(section.type).fields;
  const base = {
    type: section.type,
    title: section.title,
    hidden: section.hidden ?? false,
    entries: section.entries.map((entry) => entryToValues(entry, fields)),
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
  const header: Record<string, string> = {};
  for (const field of HEADER_SCHEMA) {
    header[field.key] = fieldToString(resume.header.fields[field.key]);
  }
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
    sections: resume.sections.map(sectionToInterchange),
  };
}

// --- interchange -> Resume content -----------------------------------------

function fillEntry(
  entry: Entry,
  fields: FieldSchema[],
  values: Record<string, string | undefined>,
): Entry {
  for (const field of fields) {
    const value = values[field.key];
    if (value === undefined) continue;
    entry.fields[field.key] =
      field.kind === "plain"
        ? { kind: "plain", value: value.trim() }
        : { kind: "richtext", value: markdownToTiptap(value) };
  }
  return entry;
}

function bodyEntry(type: "summary" | "custom", body: string): Entry {
  const entry =
    type === "custom" ? createCustomEntry("rich") : createEmptyEntry(type);
  entry.fields.body = { kind: "richtext", value: markdownToTiptap(body) };
  return entry;
}

function interchangeToSection(item: InterchangeSection): Section {
  if (item.type === "summary") {
    const section = createEmptySection("summary");
    if (item.title) section.title = item.title;
    if (item.hidden !== undefined) section.hidden = item.hidden;
    if (item.body !== undefined) {
      section.entries = [bodyEntry("summary", item.body)];
    }
    return section;
  }
  if (item.type === "custom") {
    const variant = item.variant ?? "rich";
    const section = createCustomSection(variant, item.title || undefined);
    if (item.hidden !== undefined) section.hidden = item.hidden;
    if (variant === "rich") {
      if (item.body !== undefined) {
        section.entries = [bodyEntry("custom", item.body)];
      }
      return section;
    }
    section.entries = (item.entries ?? []).map((values) =>
      fillEntry(createCustomEntry("list"), CUSTOM_LIST_FIELDS, values),
    );
    return section;
  }
  const section = createEmptySection(item.type);
  if (item.title) section.title = item.title;
  if (item.hidden !== undefined) section.hidden = item.hidden;
  const fields = getSectionSchema(item.type).fields;
  section.entries = (item.entries ?? []).map((values) =>
    fillEntry(createEmptyEntry(item.type), fields, values),
  );
  if ("columns" in item && item.columns !== undefined) {
    section.columns = item.columns;
  }
  if ("showProficiency" in item && item.showProficiency !== undefined) {
    section.showProficiency = item.showProficiency;
  }
  return section;
}

export function interchangeToContent(data: InterchangeResume): ResumeContent {
  const header = createEmptyHeader();
  for (const field of HEADER_SCHEMA) {
    const value = data.header?.[field.key];
    if (value !== undefined) {
      header.fields[field.key] = { kind: "plain", value: value.trim() };
    }
  }

  const provided = (data.sections ?? []).map(interchangeToSection);
  // Summary is pinned first; core sections the document omits are appended
  // empty so the editor always has its full fixed set.
  const sections: Section[] = [];
  const summary = provided.find((section) => section.type === "summary");
  sections.push(summary ?? createEmptySection("summary"));
  for (const section of provided) {
    if (section.type !== "summary") sections.push(section);
  }
  for (const type of CANONICAL_SECTION_ORDER) {
    if (type === "custom") continue;
    if (!sections.some((section) => section.type === type)) {
      sections.push(createEmptySection(type));
    }
  }

  return {
    title: data.title?.trim() || undefined,
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
    header,
    sections,
  };
}
