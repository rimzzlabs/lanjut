"use client";

import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { MEDIA_XL } from "@/hooks/use-media-query";
import { useResumeStore, useTourStore } from "@/lib/store";
import { EDITOR_TOUR } from "@/lib/tour";

const PREVIEW_SETTLE_MS = 700;

// Bailing out (missing résumé, sub-xl) never consumes the first-run flag.
export function TourAutostartEditor() {
  const openStatus = useResumeStore((state) => state.openStatus);
  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (openStatus !== "ready") return;
    if (!window.matchMedia(MEDIA_XL).matches) return;
    if (useTourStore.getState().hasSeen(EDITOR_TOUR)) return;
    const timer = setTimeout(
      () => startNextStep(EDITOR_TOUR),
      PREVIEW_SETTLE_MS,
    );
    return () => clearTimeout(timer);
  }, [openStatus, startNextStep]);

  return null;
}
