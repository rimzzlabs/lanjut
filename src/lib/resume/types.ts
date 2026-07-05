import type { JSONContent } from "@tiptap/core";

/**
 * In-document field-shape version. Distinct from the IndexedDB DB version, which
 * governs object-store/index structure only. Bumped whenever a persisted field
 * shape changes; every bump gets a forward-only step in the migration ladder.
 */
export const CURRENT_SCHEMA_VERSION = 5;

export type FieldKind = "plain" | "richtext";

/** A plain, unformatted value. Renders as an ordinary input, never a TipTap instance. */
export interface PlainField {
  kind: "plain";
  value: string;
}

/** A restricted TipTap document, persisted as ProseMirror JSON (never HTML). */
export interface RichTextField {
  kind: "richtext";
  value: JSONContent;
}

export type Field = PlainField | RichTextField;

/** Stable key identifying a Field within an Entry. Defined by the schema registry. */
export type FieldKey = string;

/**
 * A repeatable item within a Section (one job, one school). Holds a map of typed
 * Fields keyed by the registry's field keys. Singleton sections hold exactly one.
 */
export interface Entry {
  id: string;
  fields: Record<FieldKey, Field>;
}

export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "custom";

/**
 * A typed, reorderable unit below the Header. `title` is presentation/label data
 * only; relabeling never changes the Section's parse shape or Field schema.
 */
export interface Section {
  id: string;
  type: SectionType;
  title: string;
  entries: Entry[];
}

/**
 * The privileged, single-instance, non-reorderable top of a Resume. Always first
 * in reading order. Not a Section. Field keys are defined by the header schema.
 */
export interface Header {
  fields: Record<FieldKey, Field>;
}

/**
 * A single résumé document. Structural-only at schemaVersion 1; the presentation
 * token block is added by the first migration ladder step (see migrations.ts).
 */
export interface Resume {
  id: string;
  schemaVersion: number;
  /** The résumé's name, e.g. "Frontend Engineer, Acme". Per-job tailoring is core. */
  title: string;
  /**
   * Presentation-layer template rendering this document (e.g. "awal"). Kept a
   * loose string so the schema doesn't couple to the UI catalog; renderers fall
   * back to the default template for unknown ids.
   */
  templateId: string;
  header: Header;
  sections: Section[];
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601. */
  updatedAt: string;
}

/**
 * The lightweight projection driving the Library list, held in memory instead of
 * every full document body. Every field here is stable across schema versions.
 */
export interface ResumeIndexEntry {
  id: string;
  title: string;
  updatedAt: string;
}
