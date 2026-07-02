"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { registerResumeFlushListeners, useResumeStore } from "@/lib/store";

/**
 * Loads the résumé addressed by the route `[id]` into the store and keeps it in
 * sync with navigation: opens on mount / id change (`openResume` flushes the
 * previously open document itself), flushes + closes when leaving the editor,
 * and registers the page-lifecycle flush safety net. Synchronizing the store
 * with the route and IndexedDB is a legitimate external-system effect.
 */
export function useEditorResume() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const openResume = useResumeStore((state) => state.openResume);
  const closeResume = useResumeStore((state) => state.closeResume);
  const openStatus = useResumeStore((state) => state.openStatus);

  useEffect(() => registerResumeFlushListeners(), []);

  useEffect(() => {
    if (id) void openResume(id);
  }, [id, openResume]);

  useEffect(() => {
    return () => {
      void closeResume();
    };
  }, [closeResume]);

  return openStatus;
}
