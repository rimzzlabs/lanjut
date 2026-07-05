import { G } from "@mobily/ts-belt";
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

type PlainField = { kind: "plain"; value: string };

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
  const [firstName = "", ...rest] = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
}

function splitLocation(location: string): {
  city: string;
  province: string;
  country: string;
} {
  const [city = "", province = "", ...rest] = location
    .split(",")
    .map((part) => part.trim());
  return { city, province, country: rest.join(", ") };
}

/**
 * v1→v2: the persisted shape now mirrors the granular editor forms. Header
 * `fullName`/`headline`/`location` become `firstName`+`lastName`/`jobTitle`/
 * `city`+`province`+`country`; experience `role`/`highlights` become
 * `title`/`description` and gain a `website`, dropping `location`.
 */
const migrateV1toV2: Migration = (doc) => {
  const next = structuredClone(doc);

  const header = next.header as
    | { fields?: Record<string, unknown> }
    | undefined;
  // "in" checks guard against a doc already in v2 shape but stamped v1:
  // remapping from absent v1 keys would blank every field.
  if (
    header?.fields &&
    ("fullName" in header.fields ||
      "headline" in header.fields ||
      "location" in header.fields)
  ) {
    const hf = header.fields;
    const { firstName, lastName } = splitName(fieldValue(hf.fullName));
    const { city, province, country } = splitLocation(fieldValue(hf.location));
    header.fields = {
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
  }

  const sections = next.sections;
  if (Array.isArray(sections)) {
    for (const section of sections as Array<Record<string, unknown>>) {
      if (section.type !== "experience" || !Array.isArray(section.entries)) {
        continue;
      }
      for (const entry of section.entries as Array<Record<string, unknown>>) {
        const ef = (entry.fields ?? {}) as Record<string, unknown>;
        if (!("role" in ef) && !("highlights" in ef)) continue;
        entry.fields = {
          title: plainField(fieldValue(ef.role)),
          company: plainField(fieldValue(ef.company)),
          website: plainField(""),
          startDate: plainField(fieldValue(ef.startDate)),
          endDate: plainField(fieldValue(ef.endDate)),
          description: G.isObject(ef.highlights)
            ? ef.highlights
            : {
                kind: "richtext",
                value: { type: "doc", content: [{ type: "paragraph" }] },
              },
        };
      }
    }
  }

  return next;
};

/** Concatenates every text node within a rich-text node subtree. */
function collectText(node: unknown): string {
  if (!G.isObject(node)) return "";
  const record = node as { text?: unknown; content?: unknown };
  let text = G.isString(record.text) ? record.text : "";
  if (Array.isArray(record.content)) {
    for (const child of record.content) text += collectText(child);
  }
  return text;
}

/**
 * v2→v3: Skills becomes a repeating section (a `name` plus a `level` per skill)
 * instead of a single rich-text `body`. Existing bodies are split into one entry
 * per list item (or paragraph), with an empty level; an empty body yields a
 * single empty entry.
 */
const migrateV2toV3: Migration = (doc) => {
  const next = structuredClone(doc);
  const sections = next.sections;
  if (!Array.isArray(sections)) return next;

  for (const section of sections as Array<Record<string, unknown>>) {
    if (section.type !== "skills") continue;
    const entries = Array.isArray(section.entries) ? section.entries : [];
    const first = entries[0] as
      | { fields?: Record<string, unknown> }
      | undefined;
    // Entries without a `body` field are not the v2 single-body shape (likely a
    // mis-stamped doc already at v3+); replacing them would destroy real skills.
    if (first?.fields && !("body" in first.fields)) continue;
    const body = (first?.fields?.body as { value?: unknown } | undefined)
      ?.value;

    const names: string[] = [];
    if (
      G.isObject(body) &&
      Array.isArray((body as { content?: unknown }).content)
    ) {
      for (const block of (body as { content: unknown[] }).content) {
        const type = G.isObject(block)
          ? (block as { type?: unknown }).type
          : null;
        if (type === "bulletList" || type === "orderedList") {
          const items = (block as { content?: unknown[] }).content ?? [];
          for (const item of items) {
            const text = collectText(item).trim();
            if (text) names.push(text);
          }
        } else {
          const text = collectText(block).trim();
          if (text) names.push(text);
        }
      }
    }
    if (names.length === 0) names.push("");

    section.entries = names.map((name) => ({
      id: nanoid(),
      fields: {
        name: { kind: "plain", value: name },
        level: { kind: "plain", value: "" },
      },
    }));
  }

  return next;
};

/**
 * v3→v4: adds the Certifications and Languages sections. Existing documents gain
 * each section (with one empty entry) if it is not already present, so the new
 * editor forms have somewhere to write.
 */
const migrateV3toV4: Migration = (doc) => {
  const next = structuredClone(doc);
  const sections = Array.isArray(next.sections)
    ? (next.sections as Array<Record<string, unknown>>)
    : [];
  const hasType = (type: string) => sections.some((s) => s.type === type);

  if (!hasType("certifications")) {
    sections.push({
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
    });
  }
  if (!hasType("languages")) {
    sections.push({
      id: nanoid(),
      type: "languages",
      title: "Languages",
      entries: [
        {
          id: nanoid(),
          fields: { name: plainField(""), level: plainField("") },
        },
      ],
    });
  }

  next.sections = sections;
  return next;
};

/** v4→v5: adds the presentation-template id; existing documents keep "awal". */
const migrateV4toV5: Migration = (doc) => {
  const next = structuredClone(doc);
  if (!G.isString(next.templateId)) next.templateId = "awal";
  return next;
};

/**
 * The migration ladder. Each key N is a forward-only step from version N to N+1.
 */
const LADDER: Record<number, Migration> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
  3: migrateV3toV4,
  4: migrateV4toV5,
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
    doc = step(doc);
    version += 1;
    doc.schemaVersion = version;
  }

  return doc as unknown as Resume;
}

/** Whether a persisted document is below the current version and will be migrated. */
export function needsMigration(raw: unknown): boolean {
  return readSchemaVersion(raw) < CURRENT_SCHEMA_VERSION;
}
