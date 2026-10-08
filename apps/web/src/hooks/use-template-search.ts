import { SORTED_TEMPLATES, type TemplateId } from "@lanjut/resume/templates";
import { A, O, pipe } from "@mobily/ts-belt";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

const TEMPLATE_IDS = A.map(SORTED_TEMPLATES, (template) => template.id);

const FIRST_TEMPLATE_ID: TemplateId = pipe(
  TEMPLATE_IDS,
  A.head,
  O.getWithDefault<TemplateId>("awal"),
);

/**
 * Browse-Templates search query, held in the `q` URL param so it survives reload
 * and is shareable. Throttled and dropped from the URL when empty.
 */
export function useTemplateSearchQuery() {
  return useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true, throttleMs: 200 }),
  );
}

/** The template shown in the preview, held in the `template` URL param. */
export function useSelectedTemplate() {
  return useQueryState(
    "template",
    parseAsStringLiteral(TEMPLATE_IDS)
      .withDefault(FIRST_TEMPLATE_ID)
      .withOptions({ clearOnDefault: true }),
  );
}
