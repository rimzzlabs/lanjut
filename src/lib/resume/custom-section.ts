import { G } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
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
  let text = G.isString(record.text) ? record.text : "";
  if (Array.isArray(record.content)) {
    for (const child of record.content) text += collectText(child);
  }
  return text;
}

function blockHasText(block: JSONContent): boolean {
  return collectText(block).trim().length > 0;
}

/** Moves a `rich` section's single body into one `list` entry's description. */
function richBodyToListEntries(section: Section): Entry[] {
  const body = richValue(section.entries[0]?.fields.body);
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
  const title = plainValue(entry.fields.title).trim();
  const subtitle = plainValue(entry.fields.subtitle).trim();
  const dates = [
    plainValue(entry.fields.startDate).trim(),
    plainValue(entry.fields.endDate).trim(),
  ]
    .filter(Boolean)
    .join(" - ");
  const meta = [subtitle, dates].filter(Boolean).join(", ");

  const runs: JSONContent[] = [];
  if (title)
    runs.push({ type: "text", text: title, marks: [{ type: "bold" }] });
  if (meta) runs.push({ type: "text", text: title ? ` ${meta}` : meta });
  return runs.length > 0 ? { type: "paragraph", content: runs } : null;
}

/** Flattens every `list` entry into one `rich` body (heading line + description). */
function listEntriesToRichBody(section: Section): Entry[] {
  const blocks: JSONContent[] = [];
  for (const entry of section.entries) {
    const heading = entryHeadingParagraph(entry);
    if (heading) blocks.push(heading);
    const description = richValue(entry.fields.description);
    for (const block of description.content ?? []) {
      if (blockHasText(block)) blocks.push(block);
    }
  }
  const value: JSONContent =
    blocks.length > 0 ? { type: "doc", content: blocks } : emptyRichTextValue();
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
  const entries =
    target === "list"
      ? richBodyToListEntries(section)
      : listEntriesToRichBody(section);
  return { ...section, variant: target, entries };
}
