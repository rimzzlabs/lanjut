"use client";

import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { IS_DESKTOP } from "@/lib/build-target";

/**
 * Reads the id of the résumé the editor is open on. The counterpart to
 * `editorHref`: where the id sits in the URL is known here and nowhere else.
 */
export function useEditorId() {
  const params = useParams<{ id?: string }>();
  const [queryId] = useQueryState("id", parseAsString);

  return IS_DESKTOP ? (queryId ?? undefined) : params?.id;
}
