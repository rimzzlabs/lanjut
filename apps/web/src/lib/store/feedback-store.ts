import { create } from "zustand";
import type {
  FeedbackArea,
  FeedbackKind,
} from "@/lib/feedback/feedback-schema";

export interface OpenFeedbackOptions {
  /** Skips the kind step when the caller already knows it. */
  kind?: FeedbackKind;
  /** Overrides the area guessed from the page, as the import notice does. */
  area?: FeedbackArea;
}

interface FeedbackStoreState {
  open: boolean;
  options: OpenFeedbackOptions;
  openFeedback: (options: OpenFeedbackOptions) => void;
  setOpen: (open: boolean) => void;
}

/**
 * The feedback sheet is opened from the sidebar and from notices, but it is
 * rendered at the platform layout level: on mobile the sidebar is a sheet
 * that closes (and unmounts its children) when the feedback opens, so the
 * sheet cannot live inside it. This store carries the open flag and the
 * caller's options across that boundary.
 */
export const useFeedbackStore = create<FeedbackStoreState>()((set) => ({
  open: false,
  options: {},
  openFeedback: (options) => set({ open: true, options }),
  setOpen: (open) => set({ open }),
}));
