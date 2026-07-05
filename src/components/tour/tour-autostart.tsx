"use client";

import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { useTourStore } from "@/lib/store";
import type { TourName } from "@/lib/tour";

const ENTRANCE_SETTLE_MS = 400;

export function TourAutostart(props: { tour: TourName }) {
  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (useTourStore.getState().hasSeen(props.tour)) return;
    const timer = setTimeout(
      () => startNextStep(props.tour),
      ENTRANCE_SETTLE_MS,
    );
    return () => clearTimeout(timer);
  }, [props.tour, startNextStep]);

  return null;
}
