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

export type TemplateSort = "name-asc" | "name-desc" | "newest";

export const TEMPLATE_SORTS: TemplateSort[] = [
  "name-asc",
  "name-desc",
  "newest",
];

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
