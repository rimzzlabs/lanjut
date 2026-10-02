import { A, F, O, pipe } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import {
  emptyRichTextValue,
  updateSectionById,
  updateSections,
} from "@/lib/resume";
import type { Resume, Section } from "@/lib/resume/types";
import {
  entryId,
  plain,
  plainValue,
  rich,
  richValue,
  sectionById,
} from "./resume-form-adapter-shared";

export interface CustomBodyFormValues {
  body: JSONContent;
}

export function toCustomBodyValues(section: Section): CustomBodyFormValues {
  const body = pipe(
    A.head(section.entries),
    O.mapWithDefault(emptyRichTextValue(), (entry) =>
      richValue(entry.fields.body),
    ),
  );
  return { body };
}

// The section title is managed outside the form (add/rename dialogs), so these
// adapters only own the content and never touch `section.title`.
/** Data-last: pass the result straight to `updateOpen`. */
export function applyCustomBodyValues(
  id: string,
  values: CustomBodyFormValues,
): (resume: Resume) => Resume {
  return (resume) => {
    const section = sectionById(resume, id);
    if (O.isNone(section) || section.type !== "custom") return resume;
    const entries = [
      { id: entryId(section, 0), fields: { body: rich(values.body) } },
    ];
    return updateSections(
      resume,
      updateSectionById(section.id, (current) => ({ ...current, entries })),
    );
  };
}

export interface CustomListItemValues {
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  description: JSONContent;
}

export interface CustomListFormValues {
  entries: CustomListItemValues[];
}

export function toCustomListValues(section: Section): CustomListFormValues {
  return {
    entries: pipe(
      section.entries,
      A.map((entry) => ({
        title: plainValue(entry.fields.title),
        subtitle: plainValue(entry.fields.subtitle),
        startDate: plainValue(entry.fields.startDate),
        endDate: plainValue(entry.fields.endDate),
        description: richValue(entry.fields.description),
      })),
      F.toMutable,
    ),
  };
}

/** Data-last: pass the result straight to `updateOpen`. */
export function applyCustomListValues(
  id: string,
  values: CustomListFormValues,
): (resume: Resume) => Resume {
  return (resume) => {
    const section = sectionById(resume, id);
    if (O.isNone(section) || section.type !== "custom") return resume;
    const entries = pipe(
      values.entries,
      A.mapWithIndex((index, item) => ({
        id: entryId(section, index),
        fields: {
          title: plain(item.title),
          subtitle: plain(item.subtitle),
          startDate: plain(item.startDate),
          endDate: plain(item.endDate),
          description: rich(item.description),
        },
      })),
    );
    return updateSections(
      resume,
      updateSectionById(section.id, (current) => ({ ...current, entries })),
    );
  };
}
