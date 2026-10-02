import { A, O } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import { emptyRichTextValue } from "@/lib/resume";
import type { Field, Resume, Section } from "@/lib/resume/types";

export function plainValue(field: Field | undefined): string {
  return field?.kind === "plain" ? field.value : "";
}

export function richValue(field: Field | undefined): JSONContent {
  return field?.kind === "richtext" ? field.value : emptyRichTextValue();
}

export function plain(value: string): Field {
  return { kind: "plain", value };
}

export function rich(value: JSONContent): Field {
  return { kind: "richtext", value };
}

export function sectionOfType(
  resume: Resume,
  type: Section["type"],
): O.Option<Section> {
  return A.find(resume.sections, (section) => section.type === type);
}

/**
 * Keep entry ids stable across form-driven rebuilds by reusing the existing
 * entry's id at the same index. Regenerating ids on every keystroke invalidates
 * everything keyed by them downstream, most visibly the preview's measured
 * block heights, which collapsed pagination to a single page.
 */
export function entryId(section: Section, index: number): string {
  return O.match(
    A.get(section.entries, index),
    (entry) => entry.id,
    () => nanoid(),
  );
}

// --- Custom sections (addressed by id; shape depends on the variant) --------

export function sectionById(resume: Resume, id: string): O.Option<Section> {
  return A.find(resume.sections, (section) => section.id === id);
}
