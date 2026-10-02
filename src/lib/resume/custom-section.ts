import { A, F, G, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import { joinPresent } from "@/lib/utils";
import { emptyRichTextValue } from "./factory";
import type { CustomVariant, Entry, Field, Section } from "./types";

function plainField(value: string): Field {
  return { kind: "plain", value };
}

function plainValue(field: Field | undefined): string {
  return field?.kind === "plain" ? field.value : "";
}

function richValue(field: Field | undefined): JSONContent {
  return field?.kind === "richtext" ? field.value : emptyRichTextValue();
}

/** Concatenates every text node within a rich-text node subtree. */
function collectText(node: unknown): string {
  if (!G.isObject(node)) return "";
  const record = node as { text?: unknown; content?: unknown };
  const text = G.isString(record.text) ? record.text : "";
  if (!Array.isArray(record.content)) return text;
  return text + pipe(record.content, A.map(collectText), A.join(""));
}

function blockHasText(block: JSONContent): boolean {
  return S.isNotEmpty(S.trim(collectText(block)));
}

/** Moves a `rich` section's single body into one `list` entry's description. */
function richBodyToListEntries(section: Section): Entry[] {
  const body = pipe(
    section.entries,
    A.head,
    O.mapWithDefault(emptyRichTextValue(), (entry) =>
      richValue(entry.fields.body),
    ),
  );
  return [
    {
      id: nanoid(),
      fields: {
        title: plainField(""),
        subtitle: plainField(""),
        startDate: plainField(""),
        endDate: plainField(""),
        description: { kind: "richtext", value: body },
      },
    },
  ];
}

/** The bold heading line for one `list` entry, or null when it has no meta. */
function entryHeadingParagraph(entry: Entry): JSONContent | null {
  const title = S.trim(plainValue(entry.fields.title));
  const subtitle = S.trim(plainValue(entry.fields.subtitle));
  const dates = joinPresent(
    [
      S.trim(plainValue(entry.fields.startDate)),
      S.trim(plainValue(entry.fields.endDate)),
    ],
    " - ",
  );
  const meta = joinPresent([subtitle, dates], ", ");

  const runs = A.filterMap([titleRun(title), metaRun(meta, title)], F.identity);
  if (A.isEmpty(runs)) return null;
  return { type: "paragraph", content: F.toMutable(runs) };
}

function titleRun(title: string): O.Option<JSONContent> {
  if (!title) return O.None;
  return { type: "text", text: title, marks: [{ type: "bold" }] };
}

function metaRun(meta: string, title: string): O.Option<JSONContent> {
  if (!meta) return O.None;
  const text = title ? ` ${meta}` : meta;
  return { type: "text", text };
}

/** The heading line (when the entry has one) and the description's non-empty blocks. */
function entryToRichBlocks(entry: Entry): ReadonlyArray<JSONContent> {
  const heading = entryHeadingParagraph(entry);
  const description = A.filter(
    richValue(entry.fields.description).content ?? [],
    blockHasText,
  );
  if (!heading) return description;
  return A.prepend(description, heading);
}

function richDoc(blocks: ReadonlyArray<JSONContent>): JSONContent {
  if (A.isEmpty(blocks)) return emptyRichTextValue();
  return { type: "doc", content: F.toMutable(blocks) };
}

/** Flattens every `list` entry into one `rich` body (heading line + description). */
function listEntriesToRichBody(section: Section): Entry[] {
  const value = richDoc(A.flatMap(section.entries, entryToRichBlocks));
  return [{ id: nanoid(), fields: { body: { kind: "richtext", value } } }];
}

/**
 * Convert a custom Section to the target variant, transforming its content:
 * `rich` -> `list` moves the body into a single entry's description; `list` ->
 * `rich` flattens every entry (a bold heading line plus its description) into one
 * body. Lossy by design (structured fields collapse to text); a no-op when the
 * section is already in the target variant.
 */
export function convertCustomSection(
  section: Section,
  target: CustomVariant,
): Section {
  if ((section.variant ?? "rich") === target) return section;
  return {
    ...section,
    variant: target,
    entries: convertedEntries(section, target),
  };
}

function convertedEntries(section: Section, target: CustomVariant): Entry[] {
  if (target === "list") return richBodyToListEntries(section);
  return listEntriesToRichBody(section);
}
