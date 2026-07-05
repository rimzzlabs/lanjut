import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChangelogStoreState {
  lastSeenVersion: string;
  markSeen: (version: string) => void;
}

export const useChangelogStore = create<ChangelogStoreState>()(
  persist(
    (set) => ({
      lastSeenVersion: "",
      markSeen: (version) => set({ lastSeenVersion: version }),
    }),
    { name: "lanjut:changelog-seen" },
  ),
);
