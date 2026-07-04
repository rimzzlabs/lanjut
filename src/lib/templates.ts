/**
 * The catalog of résumé templates shown on the Browse Templates page. Presentation
 * metadata only — the rendering/adapter for each template lives under
 * `@/components/editor`. Currently a single starter template ("Awal").
 */
export interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  /** ISO 8601 — when the template was added, for "newest" sorting. */
  addedAt: string;
}

export type TemplateSort = "name-asc" | "name-desc" | "newest";

export const TEMPLATE_SORTS: TemplateSort[] = [
  "name-asc",
  "name-desc",
  "newest",
];

export const TEMPLATES: TemplateSummary[] = [
  {
    id: "awal",
    name: "Awal",
    description:
      "A clean, single-column ATS-safe starter. Linear reading order, no columns or tables, with room for every section.",
    addedAt: "2026-01-01T00:00:00.000Z",
  },
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
      template.description.toLowerCase().includes(needle),
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
