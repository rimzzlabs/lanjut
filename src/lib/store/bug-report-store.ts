import { create } from "zustand";

interface BugReportStoreState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * The bug-report dialog is triggered from the sidebar but rendered at the
 * platform layout level: on mobile the sidebar is a sheet that closes (and
 * unmounts its children) when the dialog opens, so the dialog cannot live
 * inside it. This store carries the open flag across that boundary.
 */
export const useBugReportStore = create<BugReportStoreState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
