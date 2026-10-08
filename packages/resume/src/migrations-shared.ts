import { A, D, G, O, pipe, S } from "@mobily/ts-belt";

/** A persisted document of unknown/older shape, before migration. */
export type ResumeDoc = Record<string, unknown>;

interface PlainField {
  kind: "plain";
  value: string;
}

export function plainField(value: string): PlainField {
  return { kind: "plain", value };
}

/** Reads a persisted Field's string value, tolerant of missing/malformed data. */
export function fieldValue(field: unknown): string {
  if (G.isObject(field)) {
    const value = (field as { value?: unknown }).value;
    if (G.isString(value)) return value;
  }
  return "";
}

export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName = "", ...rest] = pipe(
    fullName,
    S.trim,
    S.splitByRe(/\s+/),
    A.filter(G.isString),
    A.reject(S.isEmpty),
  );
  return { firstName, lastName: A.join(rest, " ") };
}

export function splitLocation(location: string): {
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
export function emptyRichtextField() {
  return {
    kind: "richtext",
    value: { type: "doc", content: [{ type: "paragraph" }] },
  };
}

/** A document's sections as records, or an empty list when malformed. */
export function sectionsOf(
  doc: ResumeDoc,
): ReadonlyArray<Record<string, unknown>> {
  if (!Array.isArray(doc.sections)) return [];
  return doc.sections as Array<Record<string, unknown>>;
}

/** Appends the section `create` builds unless one of `type` is present. */
export function withSection(
  sections: ReadonlyArray<Record<string, unknown>>,
  section: { type: string; create: () => Record<string, unknown> },
): ReadonlyArray<Record<string, unknown>> {
  if (A.some(sections, (s) => s.type === section.type)) return sections;
  return A.append(sections, section.create());
}

/** The `type` of a rich-text or section node, or null when it is not an object. */
export function nodeType(node: unknown): unknown {
  if (!G.isObject(node)) return null;
  return (node as { type?: unknown }).type;
}

export function isJobSection(section: Record<string, unknown>): boolean {
  return section.type === "experience" || section.type === "internship";
}

/** Stamps two columns on a section whose `columns` is not 1 or 2. */
function withTwoColumnDefault(
  section: Record<string, unknown>,
): Record<string, unknown> {
  if (section.columns === 1 || section.columns === 2) return section;
  return { ...section, columns: 2 };
}

/** Applies `withTwoColumnDefault` to the first section of `type` only. */
export function withFirstColumnsDefault(
  doc: ResumeDoc,
  type: string,
): ResumeDoc {
  if (!Array.isArray(doc.sections)) return doc;
  const sections = doc.sections as Array<Record<string, unknown>>;
  const index = A.getIndexBy(sections, (s) => s.type === type);
  if (O.isNone(index)) return doc;
  return {
    ...doc,
    sections: A.updateAt(sections, index, withTwoColumnDefault),
  };
}

/** Maps every section of a document that has a `sections` array. */
export function mapSections(
  doc: ResumeDoc,
  fn: (section: Record<string, unknown>) => Record<string, unknown>,
): ResumeDoc {
  if (!Array.isArray(doc.sections)) return doc;
  const sections = doc.sections as Array<Record<string, unknown>>;
  return { ...doc, sections: A.map(sections, fn) };
}

/** Drops `key` when it holds a value that `isValid` rejects; absence is kept. */
export function withoutMalformed(
  doc: ResumeDoc,
  field: { key: string; isValid: (value: unknown) => boolean },
): ResumeDoc {
  const value = doc[field.key];
  if (value === undefined || field.isValid(value)) return doc;
  return D.deleteKey(doc, field.key);
}
