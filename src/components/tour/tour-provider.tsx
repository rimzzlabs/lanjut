"use client";

import { NextStep, NextStepProvider } from "nextstepjs";
import type { PropsWithChildren } from "react";
import { useTourStore } from "@/lib/store";
import { TOURS } from "@/lib/tour";
import { TourCard } from "./tour-card";

function handleTourStart(tourName: string | null) {
  if (tourName) useTourStore.getState().markSeen(tourName);
}

export function TourProvider(props: PropsWithChildren) {
  return (
    <NextStepProvider>
      <NextStep
        steps={TOURS}
        cardComponent={TourCard}
        onStart={handleTourStart}
        disableConsoleLogs
      >
        {props.children}
      </NextStep>
    </NextStepProvider>
  );
}
