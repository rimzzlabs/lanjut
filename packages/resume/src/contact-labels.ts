import { A, D, G, pipe, S } from "@mobily/ts-belt";

/** The contacts that can show a label in place of their address. */
export type ContactLabelKind = "email" | "website" | "linkedin" | "link";

export const CONTACT_LABEL_KINDS: ReadonlyArray<ContactLabelKind> = [
  "email",
  "website",
  "linkedin",
  "link",
];

/**
 * Text shown in place of a contact's address, such as "LinkedIn". The link
 * still opens the full address, and the plain text export prints it.
 */
export type ContactLabels = Partial<Record<ContactLabelKind, string>>;

export const CONTACT_LABEL_MAX = 40;

function isLabel(value: unknown): value is string {
  return (
    G.isString(value) &&
    !S.isEmpty(S.trim(value)) &&
    S.length(value) <= CONTACT_LABEL_MAX
  );
}

/** The labels that are usable, from a value of unknown shape. */
export function usableContactLabels(value: unknown): ContactLabels {
  if (!G.isObject(value) || G.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  return pipe(
    CONTACT_LABEL_KINDS,
    A.filter((kind) => isLabel(record[kind])),
    A.map((kind) => [kind, S.trim(record[kind] as string)] as const),
    D.fromPairs,
  );
}
