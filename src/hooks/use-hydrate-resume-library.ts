"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/lib/store";

let started = false;

/**
 * Load the Library index into the store once per app session. Safe to call from
 * several mounted consumers at once; a module-level guard collapses them to a
 * single IndexedDB read. Synchronizing with IndexedDB is a valid effect.
 */
export function useHydrateResumeLibrary() {
  const hydrateIndex = useResumeStore((state) => state.hydrateIndex);

  useEffect(() => {
    if (started) return;
    started = true;
    void hydrateIndex();
  }, [hydrateIndex]);
}
