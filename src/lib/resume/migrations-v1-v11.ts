import { A, G, O, pipe, S } from "@mobily/ts-belt";
import { nanoid } from "nanoid";
import {
  emptyRichtextField,
  fieldValue,
  nodeType,
  plainField,
  type ResumeDoc,
  sectionsOf,
  splitLocation,
  splitName,
  withFirstColumnsDefault,
  withSection,
} from "./migrations-shared";

/**
 * v1→v2: the persisted shape now mirrors the granular editor forms. Header
 * `fullName`/`headline`/`location` become `firstName`+`lastName`/`jobTitle`/
 * `city`+`province`+`country`; experience `role`/`highlights` become
 * `title`/`description` and gain a `website`, dropping `location`.
 */
export function migrateV1toV2(doc: ResumeDoc): ResumeDoc {
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
export function migrateV2toV3(doc: ResumeDoc): ResumeDoc {
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
export function migrateV3toV4(doc: ResumeDoc): ResumeDoc {
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
export function migrateV4toV5(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  if (G.isString(next.templateId)) return next;
  return { ...next, templateId: "awal" };
}

/**
 * v5→v6: adds the Organizations section (volunteer, student, and community
 * roles). Existing documents gain it (with one empty entry) if it is not
 * already present, so the new editor form has somewhere to write.
 */
export function migrateV5toV6(doc: ResumeDoc): ResumeDoc {
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
export function migrateV6toV7(doc: ResumeDoc): ResumeDoc {
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
export function migrateV7toV8(doc: ResumeDoc): ResumeDoc {
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
export function migrateV8toV9(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const sections = withSection(sectionsOf(next), {
    type: "projects",
    create: () => createJobLikeSection("projects", "Projects"),
  });
  return { ...next, sections };
}

/**
 * v9→v10: adds the presentation-only `columns` count to the Skills section so its
 * grid can be toggled between one and two columns. Existing documents default to
 * two, preserving their current layout. Bail-safe: no Skills section means no-op.
 */
export function migrateV9toV10(doc: ResumeDoc): ResumeDoc {
  return withFirstColumnsDefault(structuredClone(doc), "skills");
}

/**
 * v10→v11: adds the header `linkedin` field. Existing documents gain it (empty)
 * so the new personal-info input has somewhere to write. Bail-safe: a document
 * without header fields, or one that already carries `linkedin`, is left as-is.
 */
export function migrateV10toV11(doc: ResumeDoc): ResumeDoc {
  const next = structuredClone(doc);
  const header = next.header as
    | { fields?: Record<string, unknown> }
    | undefined;
  if (!header?.fields || "linkedin" in header.fields) return next;
  const fields = { ...header.fields, linkedin: plainField("") };
  return { ...next, header: { ...header, fields } };
}
