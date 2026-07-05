import { A, D, F, pipe } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import {
  type FieldSchema,
  getSectionSchema,
  HEADER_SCHEMA,
} from "./schema-registry";
import {
  CURRENT_SCHEMA_VERSION,
  type Entry,
  type Field,
  type FieldKey,
  type Header,
  type Resume,
  type Section,
  type SectionType,
} from "./types";

/** An empty restricted TipTap document: a single empty paragraph. */
export function emptyRichTextValue(): JSONContent {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

function emptyField(schema: FieldSchema): Field {
  if (schema.kind === "plain") return { kind: "plain", value: "" };
  return { kind: "richtext", value: emptyRichTextValue() };
}

function fieldsFromSchema(schemas: FieldSchema[]): Record<FieldKey, Field> {
  return pipe(
    schemas,
    A.map((schema): readonly [FieldKey, Field] => [
      schema.key,
      emptyField(schema),
    ]),
    D.fromPairs,
  );
}

export function createEmptyEntry(type: SectionType): Entry {
  return {
    id: nanoid(),
    fields: fieldsFromSchema(getSectionSchema(type).fields),
  };
}

export function createEmptySection(type: SectionType): Section {
  const schema = getSectionSchema(type);
  return {
    id: nanoid(),
    type,
    title: schema.defaultTitle,
    entries: [createEmptyEntry(type)],
  };
}

export function createEmptyHeader(): Header {
  return { fields: fieldsFromSchema(HEADER_SCHEMA) };
}

/**
 * A blank structural document: Header plus one empty Entry per core Section.
 * The primary create path seeds the Seed fixture instead (see seed.ts); this is
 * the deferred "blank resume" option.
 */
export function createEmptyResume(title: string): Resume {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    title,
    templateId: "awal",
    header: createEmptyHeader(),
    sections: [
      createEmptySection("summary"),
      createEmptySection("experience"),
      createEmptySection("organizations"),
      createEmptySection("education"),
      createEmptySection("skills"),
      createEmptySection("certifications"),
      createEmptySection("languages"),
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Clone a template Resume into a fresh document: new resume/section/entry ids,
 * a new title, and fresh timestamps. Used to instantiate a new Resume from the
 * Seed fixture without sharing identity with it.
 */
export function cloneResumeAsNew(template: Resume, title: string): Resume {
  const now = new Date().toISOString();
  return {
    ...structuredClone(template),
    id: nanoid(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    title,
    header: structuredClone(template.header),
    sections: pipe(
      template.sections,
      A.map((section) => ({
        ...structuredClone(section),
        id: nanoid(),
        entries: pipe(
          section.entries,
          A.map((entry) => ({ ...structuredClone(entry), id: nanoid() })),
          F.toMutable,
        ),
      })),
      F.toMutable,
    ),
    createdAt: now,
    updatedAt: now,
  };
}
