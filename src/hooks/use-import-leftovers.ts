"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteLeftovers, getLeftovers } from "@/lib/db";
import { useResumeStore } from "@/lib/store";

/**
 * Load the import leftovers for a résumé (unplaceable text kept beside the
 * document, keyed by id) and expose a way to clear them. Re-reads when the
 * store's `leftoversVersion` bumps, so an import into the open document (which
 * keeps the same id) refreshes the surfaced leftovers without a reload.
 */
export function useImportLeftovers(resumeId: string | undefined) {
  const [items, setItems] = useState<string[]>([]);
  const version = useResumeStore((state) => state.leftoversVersion);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `version` is a deliberate re-read trigger; the leftovers store is written from elsewhere, and a bump signals that a fresh read is due.
  useEffect(() => {
    if (!resumeId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    getLeftovers(resumeId).then((leftovers) => {
      if (!cancelled) setItems(leftovers);
    });
    return () => {
      cancelled = true;
    };
  }, [resumeId, version]);

  const clear = useCallback(async () => {
    if (!resumeId) return;
    await deleteLeftovers(resumeId);
    setItems([]);
  }, [resumeId]);

  return { items, clear };
}
