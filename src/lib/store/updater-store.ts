import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Three days. Asking on every launch is noise, not a service. */
const CHECK_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

interface UpdaterStoreState {
  lastCheckedAt: number;
  dismissedVersion: string;
  markChecked: (at: number) => void;
  dismiss: (version: string) => void;
}

export const useUpdaterStore = create<UpdaterStoreState>()(
  persist(
    (set) => ({
      lastCheckedAt: 0,
      dismissedVersion: "",
      markChecked: (at) => set({ lastCheckedAt: at }),
      dismiss: (version) => set({ dismissedVersion: version }),
    }),
    { name: "lanjut:updater" },
  ),
);

/** Whether enough time has passed since the last check. */
export function updateCheckIsDue(lastCheckedAt: number, now: number): boolean {
  return now - lastCheckedAt >= CHECK_INTERVAL_MS;
}
