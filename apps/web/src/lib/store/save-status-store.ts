import { create } from "zustand";

/**
 * `outdated`: a newer build migrated the stored copy. `changed` and `deleted`:
 * another window wrote or deleted it since this window read it.
 */
export type SaveStatus =
  | "saved"
  | "saving"
  | "failed"
  | "outdated"
  | "changed"
  | "deleted";

interface SaveStatusState {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
}

/** Where the open résumé's latest edit stands against IndexedDB. */
export const useSaveStatusStore = create<SaveStatusState>()((set) => ({
  status: "saved",
  setStatus: (status) => set({ status }),
}));
