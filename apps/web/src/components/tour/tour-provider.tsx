import { useIsMobile } from "@lanjut/ui/hooks/use-mobile";
import { useTheme } from "next-themes";
import {
  type NavigationAdapter,
  NextStepProvider,
  NextStepReact,
  useNextStep,
} from "nextstepjs";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { useTranslations } from "use-intl";
import { usePathname } from "@/i18n/navigation";
import { scrollPageToTop } from "@/lib/page-scroll";
import {
  useEditorChromeStore,
  useSidebarStore,
  useTourStore,
} from "@/lib/store";
import { isSidebarSheet } from "@/lib/store/sidebar-store";
import { getTourStep, localizeTours } from "@/lib/tour";
import { inertOutsideTour } from "@/lib/tour-inert";
import { TourCard } from "./tour-card";

const SIDEBAR_SETTLE_MS = 450;

function prepareStep(tourName: string | null, stepIndex: number) {
  const step = getTourStep(tourName, stepIndex, isSidebarSheet());
  if (
    !step ||
    (!step.sidebar && !step.scrollTop && !step.sheet && !step.editorTab)
  ) {
    return;
  }
  if (step.scrollTop) scrollPageToTop();
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

// The tours never change page, but NextStepReact still asks for an adapter. Its
// built-in window adapter logs a warning on every render.
function useTourNavigation(): NavigationAdapter {
  const pathname = usePathname();
  return {
    push: (path) => window.location.assign(path),
    getCurrentPath: () => pathname,
  };
}

function handleTourEnd() {
  useSidebarStore.getState().ensureVisible(false);
  useEditorChromeStore.getState().setSheetOpen(false);
}

export function TourProvider(props: PropsWithChildren) {
  const t = useTranslations("tour");
  const phone = Boolean(useIsMobile());
  const tours = useMemo(() => localizeTours(t, phone), [t, phone]);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <NextStepProvider>
      <NextStepReact
        steps={tours}
        navigationAdapter={useTourNavigation}
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
        <TourInertPage />
        {props.children}
      </NextStepReact>
    </NextStepProvider>
  );
}

// Sheets render outside the app root, so the page goes inert through the DOM.
function TourInertPage() {
  const { isNextStepVisible } = useNextStep();

  useEffect(() => {
    if (!isNextStepVisible) return;
    return inertOutsideTour();
  }, [isNextStepVisible]);

  return null;
}
