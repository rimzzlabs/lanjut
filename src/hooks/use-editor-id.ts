import { useRoute } from "wouter";
import { EDITOR_DOCUMENT_ROUTE } from "@/lib/routes";

/**
 * Reads the id of the résumé the editor is open on. The counterpart to
 * `editorHref`: where the id sits in the URL is known here and nowhere else.
 */
export function useEditorId() {
  const [, params] = useRoute<{ id: string }>(EDITOR_DOCUMENT_ROUTE);
  return params?.id;
}
