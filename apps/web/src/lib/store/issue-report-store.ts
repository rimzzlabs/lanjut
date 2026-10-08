import { create } from "zustand";

export type IssueReportKind = "bug" | "feature";

interface IssueReportStoreState {
  open: IssueReportKind | null;
  setOpen: (open: IssueReportKind | null) => void;
}

/**
 * The report dialogs are triggered from the sidebar but rendered at the
 * platform layout level: on mobile the sidebar is a sheet that closes (and
 * unmounts its children) when a dialog opens, so the dialogs cannot live
 * inside it. This store carries the open flag across that boundary.
 */
export const useIssueReportStore = create<IssueReportStoreState>()((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
}));
