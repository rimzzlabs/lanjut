import { A, G, O, pipe } from "@mobily/ts-belt";
import {
  isJobSection,
  mapSections,
  nodeType,
  plainField,
  type ResumeDoc,
  withFirstColumnsDefault,
  withoutMalformed,
} from "./migrations-shared";

/**
 * The reading order Sections are normalized to at v12. Inlined (not imported from
 * the registry) so this step stays a frozen snapshot: it must always sort to the
 * v12 order even if the registry's canonical order later changes. Types absent
 * here sort last, keeping their original relative order.
 */
const V12_SECTION_ORDER = [
  "summary",
  "experience",
  "internship",
  "projects",
  "organizations",
  "education",
  "certifications",
  "skills",
  "languages",
  "custom",
];

function v12Rank(section: unknown): number {
  const type = nodeType(section);
  const last = A.length(V12_SECTION_ORDER);
  if (!G.isString(type)) return last;
  return pipe(
    A.getIndexBy(V12_SECTION_ORDER, (item) => item === type),
    O.getWithDefault(last),
  );
}

/**
 * v11→v12: normalizes `sections[]` into the canonical reading order. Rendering
 * moves from a hardcoded section sequence to one driven by this array's order, so
 * existing documents (written in assorted creation orders) are sorted here to
 * preserve their current on-screen output; nothing moves until the user drags a
 * section. Bail-safe: a missing/non-array `sections` is left untouched, and the
 * sort is stable so unrecognized types keep their relative position at the end.
 */
export function migrateV11toV12(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (!Array.isArray(next.sections)) return next;
  const sections = A.sort(
    next.sections as unknown[],
    (a, b) => v12Rank(a) - v12Rank(b),
  );
  return { ...next, sections };
}

/**
 * v12→v13: adds the presentation-only `showProficiency` toggle to the Skills and
 * Languages sections so per-entry levels can be hidden. Existing documents default
 * to true, preserving their current output. Bail-safe: a missing section is a
 * no-op, and a section already carrying the flag is left as-is.
 */
export function migrateV12toV13(doc: ResumeDoc): ResumeDoc {
  return mapSections(structuredClone(doc), (section) => {
    if (section.type !== "skills" && section.type !== "languages") {
      return section;
    }
    if (G.isBoolean(section.showProficiency)) return section;
    return { ...section, showProficiency: true };
  });
}

/**
 * v13→v14: adds the presentation-only `columns` count to the Languages section so
 * its grid can be toggled between one and two columns, matching Skills. Existing
 * documents default to two, preserving their current layout. Bail-safe: no
 * Languages section means no-op.
 */
export function migrateV13toV14(doc: ResumeDoc): ResumeDoc {
  return withFirstColumnsDefault(structuredClone(doc), "languages");
}

/**
 * v14→v15: adds the presentation-only `hidden` visibility toggle to every
 * section. Existing documents default to false, preserving their current
 * output. Bail-safe: a section already carrying a boolean flag is left as-is.
 */
export function migrateV14toV15(doc: ResumeDoc): ResumeDoc {
  return mapSections(structuredClone(doc), (section) => {
    if (G.isBoolean(section.hidden)) return section;
    return { ...section, hidden: false };
  });
}

/**
 * v15→v16: adds the presentation-only document-level `showIcons` toggle for the
 * header's contact icons. Existing documents default to true, preserving their
 * current output. Bail-safe: a document already carrying a boolean is left as-is.
 */
export function migrateV15toV16(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (G.isBoolean(next.showIcons)) return next;
  return { ...next, showIcons: true };
}

/**
 * v16→v17: adds the presentation-only document-level `sectionSpacing` (extra
 * space above section headings). Existing documents default to 0, preserving
 * their current output. Bail-safe: a document already carrying a number is
 * left as-is.
 */
export function migrateV16toV17(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (typeof next.sectionSpacing === "number") return next;
  return { ...next, sectionSpacing: 0 };
}

/**
 * v17→v18: introduces the optional document-level `font` override. Absence is
 * meaningful ("template default"), so existing documents need no new field;
 * the step only clears a malformed non-string value. Bail-safe: everything
 * else is left untouched.
 */
export function migrateV17toV18(doc: ResumeDoc): ResumeDoc {
  return withoutMalformed(structuredClone(doc), {
    key: "font",
    isValid: G.isString,
  });
}

/**
 * v18→v19: adds the presentation-only document-wide typography settings.
 * `letterSpacing` is stamped to 0 (no tracking), preserving current output;
 * `lineHeight` stays absent because absence means "template default".
 * Bail-safe: existing numbers are left as-is and a malformed `lineHeight` is
 * cleared.
 */
export function migrateV18toV19(doc: ResumeDoc): ResumeDoc {
  return withoutMalformed(withLetterSpacingDefault(structuredClone(doc)), {
    key: "lineHeight",
    isValid: G.isNumber,
  });
}

function withLetterSpacingDefault(doc: ResumeDoc): ResumeDoc {
  if (typeof doc.letterSpacing === "number") return doc;
  return { ...doc, letterSpacing: 0 };
}

/**
 * v19→v20: adds the presentation-only per-group font-size scales. Absence means
 * "template default" (scale 1), so existing documents need no new field; the
 * step only clears a malformed non-number value. Bail-safe: everything else is
 * left untouched.
 */
export function migrateV19toV20(doc: ResumeDoc): ResumeDoc {
  return A.reduce(
    ["nameScale", "titleScale", "bodyScale"],
    structuredClone(doc),
    (next, key) => withoutMalformed(next, { key, isValid: G.isNumber }),
  );
}

/** Adds `key` as an empty plain field to job entries that lack it. */
function withJobEntryField(
  section: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  if (!isJobSection(section) || !Array.isArray(section.entries)) {
    return section;
  }
  const entries = A.map(
    section.entries as Array<Record<string, unknown>>,
    (entry) => {
      if (!G.isObject(entry.fields)) return entry;
      const fields = entry.fields as Record<string, unknown>;
      if (key in fields) return entry;
      return { ...entry, fields: { ...fields, [key]: plainField("") } };
    },
  );
  return { ...section, entries };
}

/**
 * v20→v21: Experience and Internship entries gain a `location` (the company's
 * city). Existing entries are stamped with an empty value, so nothing renders
 * until the user fills it in. Bail-safe: an entry already carrying a `location`
 * keeps it, and anything that is not an entry-shaped object is skipped.
 */
export function migrateV20toV21(doc: ResumeDoc): ResumeDoc {
  return mapSections(structuredClone(doc), (section) =>
    withJobEntryField(section, "location"),
  );
}

/**
 * v21→v22: the header gains an optional extra `link` field (portfolio, GitHub,
 * and similar). Absence means empty; existing fields are untouched.
 */
export function migrateV21toV22(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const header = next.header as
    | { fields?: Record<string, unknown> }
    | undefined;
  if (!G.isObject(header?.fields) || "link" in header.fields) return next;
  const fields = { ...header.fields, link: plainField("") };
  return { ...next, header: { ...header, fields } };
}

/**
 * v22→v23: the header gains an optional opt-in `photo` (a data URL) and the
 * document gains its presentation tokens `photoSize`, `photoRadius`, and
 * `photoAlign`.
 * Absence means no photo and the defaults, so nothing is reshaped; the step
 * exists to stamp the version and keep the ladder gap-free.
 */
export function migrateV22toV23(doc: ResumeDoc): ResumeDoc {
  return structuredClone(doc);
}

/**
 * v23→v24: Experience and Internship entries gain an optional, plain-text
 * `companyContext`. Existing entries are stamped empty so their rendered output
 * is unchanged. Bail-safe: malformed sections and entries are skipped, and an
 * existing field is never replaced.
 */
export function migrateV23toV24(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (!Array.isArray(next.sections)) return next;
  const sections = A.map(next.sections as unknown[], (section) => {
    if (!G.isObject(section)) return section;
    return withV24CompanyContext(section as Record<string, unknown>);
  });
  return { ...next, sections };
}

function withV24CompanyContext(
  section: Record<string, unknown>,
): Record<string, unknown> {
  if (!isJobSection(section) || !Array.isArray(section.entries)) {
    return section;
  }
  const entries = A.map(section.entries as unknown[], (entry) => {
    if (!G.isObject(entry)) return entry;
    const record = entry as Record<string, unknown>;
    if (!G.isObject(record.fields)) return entry;
    const fields = record.fields as Record<string, unknown>;
    if ("companyContext" in fields) return entry;
    return { ...record, fields: { ...fields, companyContext: plainField("") } };
  });
  return { ...section, entries };
}

/**
 * v24→v25: the document gains an optional `profileId`, the profile it belongs
 * to. Absence means the first profile, so nothing is reshaped; the step exists
 * to stamp the version and keep the ladder gap-free.
 */
export function migrateV24toV25(doc: ResumeDoc): ResumeDoc {
  return structuredClone(doc);
}
