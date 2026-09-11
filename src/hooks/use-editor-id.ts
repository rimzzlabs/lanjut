"use client";

import { useParams } from "next/navigation";

/**
 * Reads the id of the résumé the editor is open on. The counterpart to
 * `editorHref`: where the id sits in the URL is known here and nowhere else.
 */
export function useEditorId() {
  const params = useParams<{ id?: string }>();
  return params?.id;
}
