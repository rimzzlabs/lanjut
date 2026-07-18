"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { NextStep, NextStepProvider } from "nextstepjs";
import { type PropsWithChildren, useMemo } from "react";
import {
  useEditorChromeStore,
  useSidebarStore,
  useTourStore,
} from "@/lib/store";
import { getTourStep, localizeTours } from "@/lib/tour";
import { TourCard } from "./tour-card";

const SIDEBAR_SETTLE_MS = 450;

function prepareStep(tourName: string | null, stepIndex: number) {
  const step = getTourStep(tourName, stepIndex);
  if (
    !step ||
    (!step.sidebar && !step.scrollTop && !step.sheet && !step.editorTab)
  ) {
    return;
  }
  if (step.scrollTop) window.scrollTo({ top: 0, behavior: "instant" });
  if (step.sidebar) {
    useSidebarStore.getState().ensureVisible(step.sidebar === "open");
  }
  // Open/close the mobile editing sheet before switching its tab, so the tab's
  // content is mounted by the time NextStep anchors to it.
  if (step.sheet) {
    useEditorChromeStore.getState().setSheetOpen(step.sheet === "open");
  }
  if (step.editorTab) {
    useEditorChromeStore.getState().setActiveTab(step.editorTab);
  }

  // NextStep re-anchors on window resize; nudge it once the sidebar/sheet and
  // the newly shown tab settle so targets get a real position.
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
  useEditorChromeStore.getState().setSheetOpen(false);
}

export function TourProvider(props: PropsWithChildren) {
  const t = useTranslations("tour");
  const tours = useMemo(() => localizeTours(t), [t]);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <NextStepProvider>
      <NextStep
        steps={tours}
        cardComponent={TourCard}
        onStart={handleTourStart}
        onStepChange={handleStepChange}
        onComplete={handleTourEnd}
        onSkip={handleTourEnd}
        noInViewScroll
        disableConsoleLogs
        shadowRgb={isDarkMode ? "255, 255, 255" : "0, 0, 0"}
        shadowOpacity={isDarkMode ? "0.15" : "0.2"}
      >
        {props.children}
      </NextStep>
    </NextStepProvider>
  );
}
