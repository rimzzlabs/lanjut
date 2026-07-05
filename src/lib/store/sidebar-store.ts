import { create } from "zustand";
import { persist } from "zustand/middleware";

// Must match MOBILE_BREAKPOINT in hooks/use-mobile.ts; below it the sidebar
// renders as a sheet controlled via `mobileControl`, not `open`.
const MOBILE_QUERY = "(max-width: 767px)";

interface SidebarStoreState {
  open: boolean;
  setOpen: (open: boolean) => void;
  mobileControl: ((open: boolean) => void) | null;
  registerMobileControl: (control: ((open: boolean) => void) | null) => void;
  ensureVisible: (visible: boolean) => void;
}

export const useSidebarStore = create<SidebarStoreState>()(
  persist(
    (set, get) => ({
      open: true,
      setOpen: (open) => set({ open }),
      mobileControl: null,
      registerMobileControl: (control) => set({ mobileControl: control }),
      ensureVisible: (visible) => {
        if (window.matchMedia(MOBILE_QUERY).matches) {
          get().mobileControl?.(visible);
          return;
        }
        if (visible) get().setOpen(true);
      },
    }),
    {
      name: "lanjut:sidebar",
      skipHydration: true,
      partialize: (state) => ({ open: state.open }),
    },
  ),
);
