"use client";

import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { useDocumentVisible } from "@/hooks/use-document-visible";
import { MEDIA_XL } from "@/hooks/use-media-query";
import { useResumeStore, useTourStore } from "@/lib/store";
import { EDITOR_SHEET_TOUR, EDITOR_TOUR } from "@/lib/tour";

const PREVIEW_SETTLE_MS = 700;

// A missing résumé never consumes the first-run flag.
export function TourAutostartEditor() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const { startNextStep } = useNextStep();
  const visible = useDocumentVisible();

  useEffect(() => {
    // The tour drives the sidebar, and which sidebar it drives depends on the
    // window width. Starting it before the window is on screen picks the wrong
    // one and leaves the two out of step.
    if (!visible || openStatus !== "ready") return;
    const tour = window.matchMedia(MEDIA_XL).matches
      ? EDITOR_TOUR
      : EDITOR_SHEET_TOUR;
    if (useTourStore.getState().hasSeen(tour)) return;
    const timer = setTimeout(() => startNextStep(tour), PREVIEW_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [visible, openStatus, startNextStep]);

  return null;
}
