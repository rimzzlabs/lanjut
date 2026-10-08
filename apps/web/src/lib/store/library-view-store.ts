import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LibraryView = "grid" | "list";

interface LibraryViewStoreState {
  view: LibraryView;
  setView: (view: LibraryView) => void;
}

export const useLibraryViewStore = create<LibraryViewStoreState>()(
  persist(
    (set) => ({
      view: "grid",
      setView: (view) => set({ view }),
    }),
    { name: "lanjut:library-view" },
  ),
);
