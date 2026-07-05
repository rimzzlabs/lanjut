"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { registerResumeFlushListeners, useResumeStore } from "@/lib/store";

/**
 * Loads the résumé addressed by the route `[id]` into the store and keeps it in
 * sync with navigation: opens on mount / id change (`openResume` flushes the
 * previously open document itself), flushes pending writes when leaving the
 * editor, and registers the page-lifecycle flush safety net. Synchronizing the
 * store with the route and IndexedDB is a legitimate external-system effect.
 */
export function useEditorResume() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const openResume = useResumeStore((state) => state.openResume);
  const flush = useResumeStore((state) => state.flush);
  const openStatus = useResumeStore((state) => state.openStatus);

  useEffect(() => registerResumeFlushListeners(), []);

  useEffect(() => {
    if (id) void openResume(id);
  }, [id, openResume]);

  // On unmount, only flush pending writes; never clear the open document.
  // Clearing it here races with the reopen effect (and React StrictMode's
  // remount): the async clear can land after `openResume` has already skipped an
  // unchanged id, stranding the store empty and the preview stuck loading.
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  return openStatus;
}
