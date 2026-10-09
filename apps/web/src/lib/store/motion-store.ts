import { A } from "@mobily/ts-belt";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MOTION_SETTINGS = ["system", "on", "off"] as const;
type MotionSetting = (typeof MOTION_SETTINGS)[number];

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export function isMotionSetting(value: string): value is MotionSetting {
  return A.includes<string>(MOTION_SETTINGS, value);
}

/** Marks <html> for the `motion-safe` and `motion-reduce` variants in globals.css. */
function applyMotionSetting(setting: MotionSetting) {
  const systemReduce = window.matchMedia(REDUCE_QUERY).matches;
  const reduce = setting === "off" || (setting === "system" && systemReduce);
  document.documentElement.dataset.motion = reduce ? "reduce" : "full";
}

interface MotionStoreState {
  setting: MotionSetting;
  setSetting: (setting: MotionSetting) => void;
}

/** The head script in src/scripts/preferences.js reads the persisted setting. */
export const useMotionStore = create<MotionStoreState>()(
  persist(
    (set) => ({
      setting: "system",
      setSetting: (setting) => {
        set({ setting });
        applyMotionSetting(setting);
      },
    }),
    {
      name: "lanjut:motion",
      partialize: (state) => ({ setting: state.setting }),
    },
  ),
);
