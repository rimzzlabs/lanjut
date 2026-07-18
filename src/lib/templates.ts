/**
 * The catalog of résumé templates shown on the Browse Templates page. Presentation
 * metadata only; the rendering for each template lives under
 * `@/components/editor/templates`.
 */
export type TemplateId =
  | "awal"
  | "ketat"
  | "luasa"
  | "tebal"
  | "klasik"
  | "ketik";

export const DEFAULT_TEMPLATE_ID: TemplateId = "awal";

export interface TemplateSummary {
  id: TemplateId;
  name: string;
  description?: string;
  /** ISO 8601: when the template was added, for "newest" sorting. */
  addedAt: string;
}

/** Coerces a persisted template id to a known one, falling back to the default. */
export function resolveTemplateId(id: string): TemplateId {
  return TEMPLATES.some((template) => template.id === id)
    ? (id as TemplateId)
    : DEFAULT_TEMPLATE_ID;
}

/**
 * Each template's baseline body line height. Mirrors the `lineHeight` in the
 * template's PDF page style (src/components/editor/pdf/<id>-pdf-document.tsx);
 * keep the two in sync. The editor's line-height slider rests here, and the
 * preview body renders it so the on-screen rhythm matches the PDF.
 */
export const TEMPLATE_LINE_HEIGHT: Record<TemplateId, number> = {
  awal: 1.4,
  ketat: 1.4,
  luasa: 1.45,
  tebal: 1.4,
  klasik: 1.45,
  ketik: 1.4,
};

/** Templates whose headers draw contact icon glyphs; the rest render text-only contacts. */
const TEMPLATE_IDS_WITH_CONTACT_ICONS: TemplateId[] = [
  "awal",
  "ketat",
  "tebal",
];

/** Whether a persisted template id renders contact icons. Unknown ids resolve to the default template first, matching renderer fallback. */
export function templateHasContactIcons(id: string): boolean {
  return TEMPLATE_IDS_WITH_CONTACT_ICONS.includes(resolveTemplateId(id));
}

export type TemplateSort = "name-asc" | "name-desc" | "newest";

export const TEMPLATE_SORTS: TemplateSort[] = [
  "name-asc",
  "name-desc",
  "newest",
];

/** Shared by the Browse Templates page and the create dialog, so both list templates in the same order. */
export const DEFAULT_TEMPLATE_SORT: TemplateSort = "name-asc";

export const TEMPLATES: TemplateSummary[] = [
  { id: "awal", name: "Awal", addedAt: "2026-01-01T00:00:00.000Z" },
  { id: "ketat", name: "Ketat", addedAt: "2026-07-04T00:00:00.000Z" },
  { id: "luasa", name: "Luasa", addedAt: "2026-07-04T00:00:00.000Z" },
  { id: "tebal", name: "Tebal", addedAt: "2026-07-05T00:00:00.000Z" },
  { id: "klasik", name: "Klasik", addedAt: "2026-07-05T00:00:00.000Z" },
  { id: "ketik", name: "Ketik", addedAt: "2026-07-05T00:00:00.000Z" },
];

export function filterTemplates(
  templates: TemplateSummary[],
  query: string,
): TemplateSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return templates;
  return templates.filter(
    (template) =>
      template.name.toLowerCase().includes(needle) ||
      (template.description?.toLowerCase().includes(needle) ?? false),
  );
}

export function sortTemplates(
  templates: TemplateSummary[],
  sort: TemplateSort,
): TemplateSummary[] {
  const sorted = [...templates];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
      return sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
}
