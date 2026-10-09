import type { ReadinessTarget } from "@lanjut/resume/readiness";
import { create } from "zustand";

/** The editor sidebar's tabs, in display order. */
export type EditorTab = "content" | "layout" | "styling" | "document";

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
  /**
   * The open items of the Content tab's section list, by item value: the
   * section id for a custom section, the section type for the rest. Held here
   * so the readiness checklist can open the section that a check points at.
   */
  openSections: string[];
  setOpenSections: (sections: string[]) => void;
  /** The field a readiness check opens the sheet on, until the sheet takes it. */
  jumpTarget: ReadinessTarget | null;
  setJumpTarget: (target: ReadinessTarget | null) => void;
}

export const useEditorChromeStore = create<EditorChromeState>()((set) => ({
  activeTab: "content",
  setActiveTab: (activeTab) => set({ activeTab }),
  sheetOpen: false,
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
  openSections: [],
  setOpenSections: (openSections) => set({ openSections }),
  jumpTarget: null,
  setJumpTarget: (jumpTarget) => set({ jumpTarget }),
}));
