import { create } from "zustand";

/** The editor sidebar's tabs, in display order. */
export type EditorTab = "editor" | "layout" | "document";

/**
 * Imperative control over the editor's sidebar chrome: which tab is active and,
 * on small screens, whether the editing sheet is open. Held in a store (rather
 * than component-local nuqs/useState) so the guided tour can drive both as it
 * walks the tabs, mirroring how `useSidebarStore.ensureVisible` lets the tour
 * open the platform sidebar.
 */
interface EditorChromeState {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  /** Only meaningful below xl, where the sidebar renders as a sheet. */
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const useEditorChromeStore = create<EditorChromeState>()((set) => ({
  activeTab: "editor",
  setActiveTab: (activeTab) => set({ activeTab }),
  sheetOpen: false,
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
}));
