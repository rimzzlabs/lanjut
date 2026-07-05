"use client";

import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { useResumeStore, useTourStore } from "@/lib/store";
import { EDITOR_TOUR } from "@/lib/tour";

const PREVIEW_SETTLE_MS = 700;

/**
 * Auto-starts the editor tour once, and only over a loaded résumé. A "missing"
 * résumé never consumes the first-run flag, so the tour still runs the first
 * time the user lands on a real one.
 */
export function TourAutostartEditor() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (openStatus !== "ready") return;
    if (useTourStore.getState().hasSeen(EDITOR_TOUR)) return;
    const timer = setTimeout(
      () => startNextStep(EDITOR_TOUR),
      PREVIEW_SETTLE_MS,
    );
    return () => clearTimeout(timer);
  }, [openStatus, startNextStep]);

  return null;
}
