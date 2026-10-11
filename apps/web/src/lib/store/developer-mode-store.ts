import type { CodeFormat } from "@lanjut/resume/interchange/code-edit";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CodeView = "code" | "split" | "preview";

interface DeveloperModeState {
  /** The opt-in from Preferences. Off for everyone until they turn it on. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  format: CodeFormat;
  setFormat: (format: CodeFormat) => void;
  view: CodeView;
  setView: (view: CodeView) => void;
}

export const useDeveloperModeStore = create<DeveloperModeState>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
      format: "markdown",
      setFormat: (format) => set({ format }),
      view: "split",
      setView: (view) => set({ view }),
    }),
    {
      name: "lanjut:developer-mode",
      partialize: (state) => ({
        enabled: state.enabled,
        format: state.format,
        view: state.view,
      }),
    },
  ),
);
