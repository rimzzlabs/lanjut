"use client";

import { useEffect, useState } from "react";
import { getResume } from "@/lib/db";
import type { Resume } from "@/lib/resume";

/**
 * Loads one full résumé document from IndexedDB for read-only display (card
 * thumbnails). Reading IndexedDB is an external-system effect; `updatedAt`
 * keys the fetch so the document is re-read when the index reports a newer
 * write.
 */
export function useResumeDocument(id: string, updatedAt: string) {
  const [resume, setResume] = useState<Resume | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `updatedAt` is a deliberate re-fetch trigger — the id alone doesn't change when the document is edited.
  useEffect(() => {
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

  return resume;
}
