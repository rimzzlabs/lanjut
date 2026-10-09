import type { Resume } from "@lanjut/resume";
import { getResume } from "@lanjut/resume/db";
import { S } from "@mobily/ts-belt";
import { useEffect, useState } from "react";

/**
 * Loads one full résumé document from IndexedDB for read-only display (card
 * thumbnails, the template preview). Reading IndexedDB is an external-system
 * effect; `updatedAt` keys the fetch so the document is re-read when the index
 * reports a newer write. An empty id loads nothing, and a document read for an
 * earlier id never shows for a new one.
 */
export function useResumeDocument(id: string, updatedAt: string) {
  const [resume, setResume] = useState<Resume | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `updatedAt` is a deliberate re-fetch trigger; the id alone doesn't change when the document is edited.
  useEffect(() => {
    if (S.isEmpty(id)) return;
    let cancelled = false;
    void getResume(id)
      .catch(() => undefined)
      .then((document) => {
        if (!cancelled) setResume(document ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, updatedAt]);

  if (resume?.id !== id) return null;
  return resume;
}
