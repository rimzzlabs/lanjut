"use client";

import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { MEDIA_XL } from "@/hooks/use-media-query";
import { useResumeStore, useTourStore } from "@/lib/store";
import { EDITOR_SHEET_TOUR, EDITOR_TOUR } from "@/lib/tour";

const PREVIEW_SETTLE_MS = 700;

// A missing résumé never consumes the first-run flag.
export function TourAutostartEditor() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (openStatus !== "ready") return;
    const tour = window.matchMedia(MEDIA_XL).matches
      ? EDITOR_TOUR
      : EDITOR_SHEET_TOUR;
    if (useTourStore.getState().hasSeen(tour)) return;
    const timer = setTimeout(() => startNextStep(tour), PREVIEW_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [openStatus, startNextStep]);

  return null;
}
