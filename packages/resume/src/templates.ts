import { A, G, O, pipe, S } from "@mobily/ts-belt";

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
  | "ketik"
  | "polos"
  | "garis"
  | "anggun"
  | "tegas"
  | "segar"
  | "rapi"
  | "lugas"
  | "kertas"
  | "jurnal"
  | "kode"
  | "mesin"
  | "ringkas"
  | "tengah"
  | "elok";

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
  if (A.some(TEMPLATES, (template) => template.id === id)) {
    return id as TemplateId;
  }
  return DEFAULT_TEMPLATE_ID;
}

/** The display name of a persisted template id, after the same fallback. */
export function templateNameOf(id: string): string {
  const resolved = resolveTemplateId(id);
  return pipe(
    TEMPLATES,
    A.find((template) => template.id === resolved),
    O.mapWithDefault<TemplateSummary, string>(
      resolved,
      (template) => template.name,
    ),
  );
}

/**
 * Each template's baseline body line height. The editor's line-height slider
 * rests here, and the preview body renders it; the PDF is drawn from the same
 * HTML, so it matches.
 */
export const TEMPLATE_LINE_HEIGHT: Record<TemplateId, number> = {
  awal: 1.4,
  ketat: 1.4,
  luasa: 1.45,
  tebal: 1.4,
  klasik: 1.45,
  ketik: 1.4,
  polos: 1.35,
  garis: 1.4,
  anggun: 1.45,
  tegas: 1.4,
  segar: 1.35,
  rapi: 1.4,
  lugas: 1.4,
  kertas: 1.35,
  jurnal: 1.45,
  kode: 1.4,
  mesin: 1.4,
  ringkas: 1.3,
  tengah: 1.4,
  elok: 1.45,
};

/** The families behind a template's `font-sans`, `font-serif`, and `font-mono` slots when no font is chosen. */
export interface TemplateFontSlots {
  sans: string;
  serif: string;
  mono: string;
}

const DEFAULT_FONT_SLOTS: TemplateFontSlots = {
  sans: "Inter",
  serif: "Lora",
  mono: "GeistMono",
};

export const TEMPLATE_FONT_SLOTS: Record<TemplateId, TemplateFontSlots> = {
  awal: DEFAULT_FONT_SLOTS,
  ketat: DEFAULT_FONT_SLOTS,
  luasa: DEFAULT_FONT_SLOTS,
  tebal: DEFAULT_FONT_SLOTS,
  klasik: DEFAULT_FONT_SLOTS,
  ketik: DEFAULT_FONT_SLOTS,
  polos: { ...DEFAULT_FONT_SLOTS, sans: "Arimo" },
  garis: DEFAULT_FONT_SLOTS,
  anggun: { ...DEFAULT_FONT_SLOTS, serif: "EBGaramond" },
  tegas: { ...DEFAULT_FONT_SLOTS, sans: "SourceSans3", serif: "Merriweather" },
  segar: { ...DEFAULT_FONT_SLOTS, sans: "OpenSans" },
  rapi: { ...DEFAULT_FONT_SLOTS, sans: "Carlito" },
  lugas: { ...DEFAULT_FONT_SLOTS, sans: "Roboto" },
  kertas: { ...DEFAULT_FONT_SLOTS, serif: "Tinos" },
  jurnal: { ...DEFAULT_FONT_SLOTS, serif: "SourceSerif4" },
  kode: { ...DEFAULT_FONT_SLOTS, mono: "IBMPlexMono" },
  mesin: { ...DEFAULT_FONT_SLOTS, mono: "CourierPrime" },
  ringkas: DEFAULT_FONT_SLOTS,
  tengah: DEFAULT_FONT_SLOTS,
  elok: DEFAULT_FONT_SLOTS,
};

/** Templates whose headers draw contact icon glyphs; the rest render text-only contacts. */
const TEMPLATE_IDS_WITH_CONTACT_ICONS: TemplateId[] = [
  "awal",
  "ketat",
  "tebal",
  "garis",
  "tegas",
  "segar",
  "lugas",
  "kode",
  "elok",
];

/** Whether a persisted template id renders contact icons. Unknown ids resolve to the default template first, matching renderer fallback. */
export function templateHasContactIcons(id: string): boolean {
  return A.includes(TEMPLATE_IDS_WITH_CONTACT_ICONS, resolveTemplateId(id));
}

export type TemplateSort = "name-asc" | "name-desc" | "newest";

/** Shared by the Browse Templates page and the create dialog, so both list templates in the same order. */
export const DEFAULT_TEMPLATE_SORT: TemplateSort = "name-asc";

export const TEMPLATES: TemplateSummary[] = [
  { id: "awal", name: "Awal", addedAt: "2026-01-01T00:00:00.000Z" },
  { id: "ketat", name: "Ketat", addedAt: "2026-07-04T00:00:00.000Z" },
  { id: "luasa", name: "Luasa", addedAt: "2026-07-04T00:00:00.000Z" },
  { id: "tebal", name: "Tebal", addedAt: "2026-07-05T00:00:00.000Z" },
  { id: "klasik", name: "Klasik", addedAt: "2026-07-05T00:00:00.000Z" },
  { id: "ketik", name: "Ketik", addedAt: "2026-07-05T00:00:00.000Z" },
  { id: "polos", name: "Polos", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "garis", name: "Garis", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "anggun", name: "Anggun", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "tegas", name: "Tegas", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "segar", name: "Segar", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "rapi", name: "Rapi", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "lugas", name: "Lugas", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "kertas", name: "Kertas", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "jurnal", name: "Jurnal", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "kode", name: "Kode", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "mesin", name: "Mesin", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "ringkas", name: "Ringkas", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "tengah", name: "Tengah", addedAt: "2026-11-02T00:00:00.000Z" },
  { id: "elok", name: "Elok", addedAt: "2026-11-02T00:00:00.000Z" },
];

export function filterTemplates(
  templates: ReadonlyArray<TemplateSummary>,
  query: string,
): ReadonlyArray<TemplateSummary> {
  const needle = pipe(query, S.trim, S.toLowerCase);
  if (!needle) return templates;
  return A.filter(
    templates,
    (template) =>
      S.includes(S.toLowerCase(template.name), needle) ||
      (G.isString(template.description) &&
        S.includes(S.toLowerCase(template.description), needle)),
  );
}

/**
 * The catalog in the default browse order. Every template grid (browse page's
 * default sort, create dialog, editor Layout tab) renders this list so the
 * surfaces can never drift apart; only the browse page re-sorts, and only when
 * the user picks another sort.
 */
export const SORTED_TEMPLATES: ReadonlyArray<TemplateSummary> = sortTemplates(
  TEMPLATES,
  DEFAULT_TEMPLATE_SORT,
);

export function sortTemplates(
  templates: ReadonlyArray<TemplateSummary>,
  sort: TemplateSort,
): ReadonlyArray<TemplateSummary> {
  switch (sort) {
    case "name-asc":
      return A.sort(templates, (a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return A.sort(templates, (a, b) => b.name.localeCompare(a.name));
    case "newest":
      return A.sort(templates, (a, b) => b.addedAt.localeCompare(a.addedAt));
  }
}
