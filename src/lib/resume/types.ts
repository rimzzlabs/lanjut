import type { JSONContent } from "@tiptap/core";

/**
 * In-document field-shape version. Distinct from the IndexedDB DB version, which
 * governs object-store/index structure only. Bumped whenever a persisted field
 * shape changes; every bump gets a forward-only step in the migration ladder.
 */
export const CURRENT_SCHEMA_VERSION = 16;

/** The language the rendered document's fixed labels (headings, dates) use. */
export type ResumeLanguage = "en" | "id";

/**
 * Presentation-only column count for grid-rendered sections (skills, languages).
 * Governs the on-screen preview and PDF visual layout only; it never changes
 * reading order, and inherently linear exports (docx, plain text) ignore it.
 */
export type SectionColumns = 1 | 2;

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
  | "internship"
  | "projects"
  | "organizations"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "custom";

/**
 * How a `custom` Section presents its content. `rich` is a single rich-text body
 * (like Summary); `list` is repeatable entries (like Experience). Only custom
 * Sections carry this; core Sections have a fixed presentation and omit it.
 */
export type CustomVariant = "rich" | "list";

/**
 * A typed, reorderable unit below the Header. `title` is presentation/label data
 * only; relabeling never changes the Section's parse shape or Field schema.
 */
export interface Section {
  id: string;
  type: SectionType;
  title: string;
  entries: Entry[];
  /**
   * Presentation-only column count for grid-rendered sections (skills, languages).
   * Absent on non-grid sections; renderers default to a two-column grid when unset.
   */
  columns?: SectionColumns;
  /**
   * Presentation-only toggle for the Skills and Languages sections: when false,
   * per-entry proficiency is hidden from the preview and every export. Absent on
   * other sections; renderers treat an unset value as `true` (proficiency shown).
   */
  showProficiency?: boolean;
  /**
   * Presentation variant for `custom` Sections only: `rich` (a single rich-text
   * body) or `list` (repeatable entries). Absent on core Sections; the custom
   * factory always sets it, and renderers treat an unset value as `rich`.
   */
  variant?: CustomVariant;
  /**
   * Presentation-only visibility toggle: when true the Section is omitted from
   * the preview and every export. Content and ordering are kept, so showing it
   * again restores exactly what was there. Renderers treat an unset value as
   * visible. The Header is not a Section and can never be hidden.
   */
  hidden?: boolean;
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
  /**
   * Presentation-layer language for the document's fixed labels (section
   * headings, month names, "Present"). Independent of the app's UI locale and
   * of the content the user types.
   */
  language: ResumeLanguage;
  /**
   * Presentation-only toggle for the header's contact icons: when false, icon
   * glyphs are omitted from the preview and PDF export. Contact text is always
   * kept, so parsing and text exports are unaffected. Renderers treat an unset
   * value as `true`; templates that never draw icons ignore it.
   */
  showIcons?: boolean;
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
