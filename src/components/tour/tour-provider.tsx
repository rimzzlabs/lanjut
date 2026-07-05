"use client";

import { NextStep, NextStepProvider } from "nextstepjs";
import type { PropsWithChildren } from "react";
import { useSidebarStore, useTourStore } from "@/lib/store";
import { getTourStep, TOURS } from "@/lib/tour";
import { TourCard } from "./tour-card";

const SIDEBAR_SETTLE_MS = 400;

function prepareStep(tourName: string | null, stepIndex: number) {
  const step = getTourStep(tourName, stepIndex);
  if (!step?.sidebar) return;
  useSidebarStore.getState().ensureVisible(step.sidebar === "open");
  // NextStep re-anchors on window resize; nudge it once the sidebar settles
  // so targets that mount with the mobile sheet get a real position.
  setTimeout(
    () => window.dispatchEvent(new Event("resize")),
    SIDEBAR_SETTLE_MS,
  );
}

function handleTourStart(tourName: string | null) {
  if (!tourName) return;
  useTourStore.getState().markSeen(tourName);
  prepareStep(tourName, 0);
}

function handleStepChange(stepIndex: number, tourName: string | null) {
  prepareStep(tourName, stepIndex);
}

function handleTourEnd() {
  useSidebarStore.getState().ensureVisible(false);
}

export function TourProvider(props: PropsWithChildren) {
  return (
    <NextStepProvider>
      <NextStep
        steps={TOURS}
        cardComponent={TourCard}
        onStart={handleTourStart}
        onStepChange={handleStepChange}
        onComplete={handleTourEnd}
        onSkip={handleTourEnd}
        disableConsoleLogs
      >
        {props.children}
      </NextStep>
    </NextStepProvider>
  );
}
