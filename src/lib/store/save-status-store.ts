import { create } from "zustand";

export type SaveStatus = "saved" | "saving" | "failed";

interface SaveStatusState {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
}

/** Where the open résumé's latest edit stands against IndexedDB. */
export const useSaveStatusStore = create<SaveStatusState>()((set) => ({
  status: "saved",
  setStatus: (status) => set({ status }),
}));
