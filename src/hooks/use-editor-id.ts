import { parseAsString, useQueryState } from "nuqs";

/**
 * Reads the id of the résumé the editor is open on. The counterpart to
 * `editorHref`: where the id sits in the URL is known here and nowhere else.
 */
export function useEditorId() {
  const [id] = useQueryState("id", parseAsString);
  return id ?? undefined;
}
