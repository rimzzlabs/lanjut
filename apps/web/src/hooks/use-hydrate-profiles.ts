import { useEffect } from "react";
import { useProfileStore } from "@/lib/store";

let started = false;

/**
 * Load the saved profiles into the store once per app session. A module-level
 * guard collapses several mounted consumers to one IndexedDB read.
 * Synchronizing with IndexedDB is a valid effect.
 */
export function useHydrateProfiles() {
  const hydrate = useProfileStore((state) => state.hydrate);

  useEffect(() => {
    if (started) return;
    started = true;
    void hydrate();
  }, [hydrate]);
}
