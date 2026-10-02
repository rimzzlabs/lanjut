import { A, D, G, O, pipe, S } from "@mobily/ts-belt";
import { nanoid } from "nanoid";
import { CURRENT_SCHEMA_VERSION, type Resume } from "./types";

/** A persisted document of unknown/older shape, before migration. */
type ResumeDoc = Record<string, unknown>;

/**
 * A forward-only migration from version N to N+1, keyed by N. Each step is a pure
 * JSON→JSON function over a plain document, testable with fixtures; never runs
 * inside idb's onupgradeneeded (that governs store structure only; see
 * docs/schema-migrations.md). Steps must bail out (keep the original data) when a
 * document does not match the shape they expect: a mis-stamped schemaVersion
 * must degrade to a no-op, never to blanked or replaced fields.
 */
type Migration = (doc: ResumeDoc) => ResumeDoc;

interface PlainField {
  kind: "plain";
  value: string;
}

function plainField(value: string): PlainField {
  return { kind: "plain", value };
}

/** Reads a persisted Field's string value, tolerant of missing/malformed data. */
function fieldValue(field: unknown): string {
  if (G.isObject(field)) {
    const value = (field as { value?: unknown }).value;
    if (G.isString(value)) return value;
  }
  return "";
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = "", ...rest] = pipe(
    fullName,
    S.trim,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
  );
  return { firstName, lastName: A.join(rest, " ") };
}

function splitLocation(location: string): {
  city: string;
  province: string;
  country: string;
} {
  const [city = "", province = "", ...rest] = pipe(
    location,
    S.split(","),
    A.map(S.trim),
  );
  return { city, province, country: A.join(rest, ", ") };
}

/** The empty rich-text value new sections and entries start from. */
function emptyRichtextField() {
  return {
    kind: "richtext",
    value: { type: "doc", content: [{ type: "paragraph" }] },
  };
}

/** A document's sections as records, or an empty list when malformed. */
function sectionsOf(doc: ResumeDoc): ReadonlyArray<Record<string, unknown>> {
  if (!Array.isArray(doc.sections)) return [];
  return doc.sections as Array<Record<string, unknown>>;
}

/** Appends the section `create` builds unless one of `type` is present. */
function withSection(
  sections: ReadonlyArray<Record<string, unknown>>,
  section: { type: string; create: () => Record<string, unknown> },
): ReadonlyArray<Record<string, unknown>> {
  if (A.some(sections, (s) => s.type === section.type)) return sections;
  return A.append(sections, section.create());
}

/** The `type` of a rich-text or section node, or null when it is not an object. */
function nodeType(node: unknown): unknown {
  if (!G.isObject(node)) return null;
  return (node as { type?: unknown }).type;
}

function isJobSection(section: Record<string, unknown>): boolean {
  return section.type === "experience" || section.type === "internship";
}

/**
 * v1→v2: the persisted shape now mirrors the granular editor forms. Header
 * `fullName`/`headline`/`location` become `firstName`+`lastName`/`jobTitle`/
 * `city`+`province`+`country`; experience `role`/`highlights` become
 * `title`/`description` and gain a `website`, dropping `location`.
 */
function migrateV1toV2(doc: ResumeDoc): ResumeDoc {
  return pipe(structuredClone(doc), migrateV1Header, migrateV1Experience);
}

function migrateV1Header(doc: ResumeDoc): ResumeDoc {
  const header = doc.header as { fields?: Record<string, unknown> } | undefined;
  // "in" checks guard against a doc already in v2 shape but stamped v1:
  // remapping from absent v1 keys would blank every field.
  if (
    !header?.fields ||
    !(
      "fullName" in header.fields ||
      "headline" in header.fields ||
      "location" in header.fields
    )
  ) {
    return doc;
  }
  const hf = header.fields;
  const { firstName, lastName } = splitName(fieldValue(hf.fullName));
  const { city, province, country } = splitLocation(fieldValue(hf.location));
  const fields = {
    firstName: plainField(firstName),
    lastName: plainField(lastName),
    jobTitle: plainField(fieldValue(hf.headline)),
    email: plainField(fieldValue(hf.email)),
    phone: plainField(fieldValue(hf.phone)),
    website: plainField(fieldValue(hf.website)),
    city: plainField(city),
    province: plainField(province),
    country: plainField(country),
  };
  return { ...doc, header: { ...header, fields } };
}

function migrateV1Experience(doc: ResumeDoc): ResumeDoc {
  if (!Array.isArray(doc.sections)) return doc;
  const sections = doc.sections as Array<Record<string, unknown>>;
  return { ...doc, sections: A.map(sections, migrateV1ExperienceSection) };
}

function migrateV1ExperienceSection(
  section: Record<string, unknown>,
): Record<string, unknown> {
  if (section.type !== "experience" || !Array.isArray(section.entries)) {
    return section;
  }
  const entries = section.entries as Array<Record<string, unknown>>;
  return { ...section, entries: A.map(entries, migrateV1ExperienceEntry) };
}

function migrateV1ExperienceEntry(
  entry: Record<string, unknown>,
): Record<string, unknown> {
  const ef = (entry.fields ?? {}) as Record<string, unknown>;
  if (!("role" in ef) && !("highlights" in ef)) return entry;
  const fields = {
    title: plainField(fieldValue(ef.role)),
    company: plainField(fieldValue(ef.company)),
    website: plainField(""),
    startDate: plainField(fieldValue(ef.startDate)),
    endDate: plainField(fieldValue(ef.endDate)),
    description: highlightsOrEmpty(ef.highlights),
  };
  return { ...entry, fields };
}

function highlightsOrEmpty(highlights: unknown): unknown {
  if (G.isObject(highlights)) return highlights;
  return emptyRichtextField();
}

/** Concatenates every text node within a rich-text node subtree. */
function collectText(node: unknown): string {
  if (!G.isObject(node)) return "";
  const record = node as { text?: unknown; content?: unknown };
  const text = G.isString(record.text) ? record.text : "";
  if (!Array.isArray(record.content)) return text;
  return text + pipe(record.content, A.map(collectText), A.join(""));
}

/** The trimmed text of each node, dropping the ones with no text. */
function nonEmptyTexts(nodes: ReadonlyArray<unknown>): ReadonlyArray<string> {
  return pipe(
    nodes,
    A.map((node) => S.trim(collectText(node))),
    A.filter(S.isNotEmpty),
  );
}

/** One skill name per list item, or the whole block for anything else. */
function blockSkillNames(block: unknown): ReadonlyArray<string> {
  const type = nodeType(block);
  if (type !== "bulletList" && type !== "orderedList") {
    return nonEmptyTexts([block]);
  }
  const items = (block as { content?: unknown[] }).content ?? [];
  // Spreading keeps the iteration semantics of the original for-of loop.
  return nonEmptyTexts([...items]);
}

function skillNames(body: unknown): ReadonlyArray<string> {
  if (!G.isObject(body)) return [];
  const content = (body as { content?: unknown }).content;
  if (!Array.isArray(content)) return [];
  return A.flatMap(content, blockSkillNames);
}

/** The skill names of a v2 body, or one empty name so the section keeps an entry. */
function skillNamesOrBlank(body: unknown): ReadonlyArray<string> {
  const names = skillNames(body);
  if (A.isEmpty(names)) return [""];
  return names;
}

function firstEntryOf(
  entries: unknown,
): { fields?: Record<string, unknown> } | undefined {
  if (!Array.isArray(entries)) return undefined;
  return pipe(entries, A.head, O.toUndefined) as
    | { fields?: Record<string, unknown> }
    | undefined;
}

/**
 * v2→v3: Skills becomes a repeating section (a `name` plus a `level` per skill)
 * instead of a single rich-text `body`. Existing bodies are split into one entry
 * per list item (or paragraph), with an empty level; an empty body yields a
 * single empty entry.
 */
function migrateV2toV3(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (!Array.isArray(next.sections)) return next;
  const sections = next.sections as Array<Record<string, unknown>>;
  return { ...next, sections: A.map(sections, migrateV2SkillsSection) };
}

function migrateV2SkillsSection(
  section: Record<string, unknown>,
): Record<string, unknown> {
  if (section.type !== "skills") return section;
  const first = firstEntryOf(section.entries);
  // Entries without a `body` field are not the v2 single-body shape (likely a
  // mis-stamped doc already at v3+); replacing them would destroy real skills.
  if (first?.fields && !("body" in first.fields)) return section;
  const body = (first?.fields?.body as { value?: unknown } | undefined)?.value;
  const entries = A.map(skillNamesOrBlank(body), (name) => ({
    id: nanoid(),
    fields: {
      name: { kind: "plain", value: name },
      level: { kind: "plain", value: "" },
    },
  }));
  return { ...section, entries };
}

/**
 * v3→v4: adds the Certifications and Languages sections. Existing documents gain
 * each section (with one empty entry) if it is not already present, so the new
 * editor forms have somewhere to write.
 */
function migrateV3toV4(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const sections = pipe(
    sectionsOf(next),
    (current) =>
      withSection(current, {
        type: "certifications",
        create: createV4Certifications,
      }),
    (current) =>
      withSection(current, { type: "languages", create: createV4Languages }),
  );
  return { ...next, sections };
}

function createV4Certifications(): Record<string, unknown> {
  return {
    id: nanoid(),
    type: "certifications",
    title: "Certifications",
    entries: [
      {
        id: nanoid(),
        fields: {
          name: plainField(""),
          issuer: plainField(""),
          url: plainField(""),
        },
      },
    ],
  };
}

function createV4Languages(): Record<string, unknown> {
  return {
    id: nanoid(),
    type: "languages",
    title: "Languages",
    entries: [
      {
        id: nanoid(),
        fields: { name: plainField(""), level: plainField("") },
      },
    ],
  };
}

/** v4→v5: adds the presentation-template id; existing documents keep "awal". */
function migrateV4toV5(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (G.isString(next.templateId)) return next;
  return { ...next, templateId: "awal" };
}

/**
 * v5→v6: adds the Organizations section (volunteer, student, and community
 * roles). Existing documents gain it (with one empty entry) if it is not
 * already present, so the new editor form has somewhere to write.
 */
function migrateV5toV6(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const sections = withSection(sectionsOf(next), {
    type: "organizations",
    create: createV6Organizations,
  });
  return { ...next, sections };
}

function createV6Organizations(): Record<string, unknown> {
  return {
    id: nanoid(),
    type: "organizations",
    title: "Organizations",
    entries: [
      {
        id: nanoid(),
        fields: {
          role: plainField(""),
          organization: plainField(""),
          startDate: plainField(""),
          endDate: plainField(""),
          description: emptyRichtextField(),
        },
      },
    ],
  };
}

/**
 * v6→v7: adds the document `language` for localized section headings and dates.
 * Existing documents default to English, preserving their current output.
 */
function migrateV6toV7(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (next.language === "en" || next.language === "id") return next;
  return { ...next, language: "en" };
}

/** A section shaped like Experience, with one empty entry, for v8 and v9. */
function createJobLikeSection(
  type: string,
  title: string,
): Record<string, unknown> {
  return {
    id: nanoid(),
    type,
    title,
    entries: [
      {
        id: nanoid(),
        fields: {
          title: plainField(""),
          company: plainField(""),
          website: plainField(""),
          startDate: plainField(""),
          endDate: plainField(""),
          description: emptyRichtextField(),
        },
      },
    ],
  };
}

/**
 * v7→v8: adds the Internship section (structurally identical to Experience, only
 * the heading differs). Existing documents gain it (with one empty entry) if it
 * is not already present, so the new editor form has somewhere to write.
 */
function migrateV7toV8(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const sections = withSection(sectionsOf(next), {
    type: "internship",
    create: () => createJobLikeSection("internship", "Internship"),
  });
  return { ...next, sections };
}

/**
 * v8→v9: adds the Projects section (structurally identical to Experience, only
 * the heading differs). Existing documents gain it (with one empty entry) if it
 * is not already present, so the new editor form has somewhere to write.
 */
function migrateV8toV9(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const sections = withSection(sectionsOf(next), {
    type: "projects",
    create: () => createJobLikeSection("projects", "Projects"),
  });
  return { ...next, sections };
}

/** Stamps two columns on a section whose `columns` is not 1 or 2. */
function withTwoColumnDefault(
  section: Record<string, unknown>,
): Record<string, unknown> {
  if (section.columns === 1 || section.columns === 2) return section;
  return { ...section, columns: 2 };
}

/** Applies `withTwoColumnDefault` to the first section of `type` only. */
function withFirstColumnsDefault(doc: ResumeDoc, type: string): ResumeDoc {
  if (!Array.isArray(doc.sections)) return doc;
  const sections = doc.sections as Array<Record<string, unknown>>;
  const index = A.getIndexBy(sections, (s) => s.type === type);
  if (O.isNone(index)) return doc;
  return {
    ...doc,
    sections: A.updateAt(sections, index, withTwoColumnDefault),
  };
}

/**
 * v9→v10: adds the presentation-only `columns` count to the Skills section so its
 * grid can be toggled between one and two columns. Existing documents default to
 * two, preserving their current layout. Bail-safe: no Skills section means no-op.
 */
function migrateV9toV10(doc: ResumeDoc): ResumeDoc {
  return withFirstColumnsDefault(structuredClone(doc), "skills");
}

/**
 * v10→v11: adds the header `linkedin` field. Existing documents gain it (empty)
 * so the new personal-info input has somewhere to write. Bail-safe: a document
 * without header fields, or one that already carries `linkedin`, is left as-is.
 */
function migrateV10toV11(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const header = next.header as
    | { fields?: Record<string, unknown> }
    | undefined;
  if (!header?.fields || "linkedin" in header.fields) return next;
  const fields = { ...header.fields, linkedin: plainField("") };
  return { ...next, header: { ...header, fields } };
}

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
function migrateV11toV12(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (!Array.isArray(next.sections)) return next;
  const sections = A.sort(
    next.sections as unknown[],
    (a, b) => v12Rank(a) - v12Rank(b),
  );
  return { ...next, sections };
}

/** Maps every section of a document that has a `sections` array. */
function mapSections(
  doc: ResumeDoc,
  fn: (section: Record<string, unknown>) => Record<string, unknown>,
): ResumeDoc {
  if (!Array.isArray(doc.sections)) return doc;
  const sections = doc.sections as Array<Record<string, unknown>>;
  return { ...doc, sections: A.map(sections, fn) };
}

/**
 * v12→v13: adds the presentation-only `showProficiency` toggle to the Skills and
 * Languages sections so per-entry levels can be hidden. Existing documents default
 * to true, preserving their current output. Bail-safe: a missing section is a
 * no-op, and a section already carrying the flag is left as-is.
 */
function migrateV12toV13(doc: ResumeDoc): ResumeDoc {
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
function migrateV13toV14(doc: ResumeDoc): ResumeDoc {
  return withFirstColumnsDefault(structuredClone(doc), "languages");
}

/**
 * v14→v15: adds the presentation-only `hidden` visibility toggle to every
 * section. Existing documents default to false, preserving their current
 * output. Bail-safe: a section already carrying a boolean flag is left as-is.
 */
function migrateV14toV15(doc: ResumeDoc): ResumeDoc {
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
function migrateV15toV16(doc: ResumeDoc): ResumeDoc {
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
function migrateV16toV17(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (typeof next.sectionSpacing === "number") return next;
  return { ...next, sectionSpacing: 0 };
}

/** Drops `key` when it holds a value that `isValid` rejects; absence is kept. */
function withoutMalformed(
  doc: ResumeDoc,
  field: { key: string; isValid: (value: unknown) => boolean },
): ResumeDoc {
  const value = doc[field.key];
  if (value === undefined || field.isValid(value)) return doc;
  return D.deleteKey(doc, field.key);
}

/**
 * v17→v18: introduces the optional document-level `font` override. Absence is
 * meaningful ("template default"), so existing documents need no new field;
 * the step only clears a malformed non-string value. Bail-safe: everything
 * else is left untouched.
 */
function migrateV17toV18(doc: ResumeDoc): ResumeDoc {
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
function migrateV18toV19(doc: ResumeDoc): ResumeDoc {
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
function migrateV19toV20(doc: ResumeDoc): ResumeDoc {
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
function migrateV20toV21(doc: ResumeDoc): ResumeDoc {
  return mapSections(structuredClone(doc), (section) =>
    withJobEntryField(section, "location"),
  );
}

/**
 * v21→v22: the header gains an optional extra `link` field (portfolio, GitHub,
 * and similar). Absence means empty; existing fields are untouched.
 */
function migrateV21toV22(doc: ResumeDoc): ResumeDoc {
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
function migrateV22toV23(doc: ResumeDoc): ResumeDoc {
  return structuredClone(doc);
}

/**
 * v23→v24: Experience and Internship entries gain an optional, plain-text
 * `companyContext`. Existing entries are stamped empty so their rendered output
 * is unchanged. Bail-safe: malformed sections and entries are skipped, and an
 * existing field is never replaced.
 */
function migrateV23toV24(doc: ResumeDoc): ResumeDoc {
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
 * The migration ladder. Each key N is a forward-only step from version N to N+1.
 */
const LADDER: Record<number, Migration> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
  3: migrateV3toV4,
  4: migrateV4toV5,
  5: migrateV5toV6,
  6: migrateV6toV7,
  7: migrateV7toV8,
  8: migrateV8toV9,
  9: migrateV9toV10,
  10: migrateV10toV11,
  11: migrateV11toV12,
  12: migrateV12toV13,
  13: migrateV13toV14,
  14: migrateV14toV15,
  15: migrateV15toV16,
  16: migrateV16toV17,
  17: migrateV17toV18,
  18: migrateV18toV19,
  19: migrateV19toV20,
  20: migrateV20toV21,
  21: migrateV21toV22,
  22: migrateV22toV23,
  23: migrateV23toV24,
};

/** The persisted schemaVersion of a raw document; 0 when absent or malformed. */
export function readSchemaVersion(raw: unknown): number {
  const doc = raw as ResumeDoc | null | undefined;
  return G.isNumber(doc?.schemaVersion) ? doc.schemaVersion : 0;
}

/**
 * Step a persisted document up to the current schema version. Run at read time,
 * per document. Throws on a document written by a newer app version (no forward
 * compatibility) or a missing ladder rung (a version gap that should never ship).
 */
export function runMigrations(raw: unknown): Resume {
  let doc = raw as ResumeDoc;
  let version = readSchemaVersion(doc);

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Resume schemaVersion ${version} is newer than supported ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  while (version < CURRENT_SCHEMA_VERSION) {
    const step = LADDER[version];
    if (!step) {
      throw new Error(`No migration registered from schemaVersion ${version}.`);
    }
    version += 1;
    doc = { ...step(doc), schemaVersion: version };
  }

  return doc as unknown as Resume;
}

/** Whether a persisted document is below the current version and will be migrated. */
export function needsMigration(raw: unknown): boolean {
  return readSchemaVersion(raw) < CURRENT_SCHEMA_VERSION;
}
