import { A, F, O, pipe, S } from "@mobily/ts-belt";
import type { Step } from "nextstepjs";
import { PROFILE_PATHNAME, TEMPLATE_PATHNAME } from "@/lib/routes";
import type { EditorTab } from "@/lib/store";

export const LIBRARY_TOUR = "library";
export const TEMPLATE_TOUR = "template";
export const EDITOR_TOUR = "editor";
export const EDITOR_SHEET_TOUR = "editor-sheet";
export const PROFILES_TOUR = "profiles";

export type TourName =
  | typeof LIBRARY_TOUR
  | typeof TEMPLATE_TOUR
  | typeof EDITOR_TOUR
  | typeof EDITOR_SHEET_TOUR
  | typeof PROFILES_TOUR;

export interface AppStep extends Step {
  sidebar?: "open" | "closed";
  scrollTop?: boolean;
  /** Editor tab to switch to before the step anchors, so its content is shown. */
  editorTab?: EditorTab;
  /** Below xl, whether the editing sheet should be open for this step. */
  sheet?: "open" | "closed";
}

/** A step's form on a smaller screen: its own copy, target, and side. */
export interface StepVariant {
  /** Copy key, in place of the step's own. */
  id: string;
  selector: string;
  side: Step["side"];
}

export interface AppStepMeta extends Omit<AppStep, "title" | "content"> {
  id: string;
  /**
   * Below md, where the sidebar is a sheet narrower than the card. A step
   * about the sidebar then points at the menu button and leaves the sheet
   * closed.
   */
  phone?: StepVariant;
  /**
   * Below lg, where the Profiles page shows a profile's details in a drawer,
   * so a step about them points at the list that opens it.
   */
  narrow?: StepVariant;
}

/** The screen a tour runs on: below md (`phone`), and below lg (`narrow`). */
export interface TourScreen {
  phone: boolean;
  narrow: boolean;
}

export interface AppTourMeta {
  tour: TourName;
  steps: AppStepMeta[];
}

export interface AppTour {
  tour: TourName;
  steps: AppStep[];
}

export function tourForPathname(pathname: string, editing: boolean): TourName {
  if (editing) return EDITOR_TOUR;
  if (S.startsWith(pathname, TEMPLATE_PATHNAME)) return TEMPLATE_TOUR;
  if (S.startsWith(pathname, PROFILE_PATHNAME)) return PROFILES_TOUR;
  return LIBRARY_TOUR;
}

function forScreen(step: AppStepMeta, screen: TourScreen): AppStepMeta {
  if (screen.phone && step.phone !== undefined) {
    return { ...step, ...step.phone, sidebar: "closed" };
  }
  if (screen.narrow && step.narrow !== undefined) {
    return { ...step, ...step.narrow };
  }
  return step;
}

export function getTourStep(
  tourName: string | null,
  stepIndex: number,
  screen: TourScreen,
): AppStepMeta | undefined {
  const tour = A.find(TOUR_STEPS, (t) => t.tour === tourName);
  return pipe(
    tour,
    O.flatMap((found) => A.get(found.steps, stepIndex)),
    O.map((step) => forScreen(step, screen)),
    O.toUndefined,
  );
}

export function localizeTours(
  t: (key: string) => string,
  screen: TourScreen,
): AppTour[] {
  const tours = A.map(TOUR_STEPS, (tour) => ({
    tour: tour.tour,
    steps: F.toMutable(
      A.map(tour.steps, (meta) => {
        const step = forScreen(meta, screen);
        return {
          ...step,
          title: t(`${tour.tour}.${step.id}.title`),
          content: t(`${tour.tour}.${step.id}.content`),
        };
      }),
    ),
  }));
  return F.toMutable(tours);
}

// A tour only points; it never lets the pointed-at control act. The blocker
// over the spotlight stops clicks, and the provider makes the page inert, which
// stops the keyboard too, so a step cannot open a sheet under its own card.
const BASE_STEP = {
  icon: null,
  showControls: true,
  showSkip: true,
  pointerPadding: 12,
  pointerRadius: 16,
  disableInteraction: true,
} satisfies Partial<Step>;

// Library and template targets all sit at the top of the page's scroll region.
const TOP_STEP = {
  ...BASE_STEP,
  scrollTop: true,
} satisfies Partial<AppStepMeta>;

export const TOUR_STEPS: AppTourMeta[] = [
  {
    tour: LIBRARY_TOUR,
    steps: [
      { ...TOP_STEP, id: "welcome", sidebar: "closed" },
      {
        ...TOP_STEP,
        id: "create",
        sidebar: "closed",
        selector: "#tour-create-resume",
        side: "bottom-right",
      },
      {
        ...TOP_STEP,
        id: "start",
        sidebar: "closed",
        selector: "#tour-library-start",
        side: "bottom",
      },
      {
        ...TOP_STEP,
        id: "search",
        sidebar: "closed",
        selector: "#tour-search-resume",
        side: "bottom-left",
      },
      {
        ...TOP_STEP,
        id: "nav",
        sidebar: "open",
        selector: "#tour-sidebar-nav",
        side: "right",
        phone: {
          id: "navPhone",
          selector: "#tour-menu-button",
          side: "bottom-left",
        },
      },
      {
        ...TOP_STEP,
        id: "replay",
        sidebar: "open",
        selector: "#tour-guide",
        side: "right",
        phone: {
          id: "replayPhone",
          selector: "#tour-menu-button",
          side: "bottom-left",
        },
      },
    ],
  },
  {
    tour: TEMPLATE_TOUR,
    steps: [
      {
        ...TOP_STEP,
        id: "browse",
        sidebar: "closed",
        selector: "#tour-template-list",
        side: "right",
      },
      {
        ...TOP_STEP,
        id: "preview",
        sidebar: "closed",
        selector: "#tour-template-try",
        side: "bottom-left",
      },
      {
        ...TOP_STEP,
        id: "search",
        sidebar: "closed",
        selector: "#tour-search-template",
        side: "bottom-right",
      },
    ],
  },
  {
    tour: PROFILES_TOUR,
    steps: [
      { ...TOP_STEP, id: "intro", sidebar: "closed" },
      {
        ...TOP_STEP,
        id: "list",
        sidebar: "closed",
        selector: "#tour-profile-list",
        side: "right",
      },
      {
        ...TOP_STEP,
        id: "add",
        sidebar: "closed",
        selector: "#tour-add-profile",
        side: "bottom-right",
      },
      {
        ...TOP_STEP,
        id: "import",
        sidebar: "closed",
        selector: "#tour-import-profile",
        side: "bottom-right",
        phone: {
          id: "import",
          selector: "#tour-import-profile",
          side: "bottom-left",
        },
      },
      {
        ...TOP_STEP,
        id: "backup",
        sidebar: "closed",
        selector: "#tour-profile-backup",
        side: "bottom",
        narrow: {
          id: "backupNarrow",
          selector: "#tour-profile-list",
          side: "bottom",
        },
      },
      {
        ...TOP_STEP,
        id: "switch",
        sidebar: "closed",
        selector: "#tour-profile-menu",
        side: "bottom-right",
      },
    ],
  },
  {
    // Desktop: the sidebar is always visible, so each step just switches the
    // tab it explains and anchors to that tab's content.
    tour: EDITOR_TOUR,
    steps: [
      {
        ...BASE_STEP,
        id: "preview",
        selector: "#tour-editor-preview",
        side: "right",
      },
      {
        ...BASE_STEP,
        id: "readiness",
        selector: "#tour-editor-readiness",
        side: "bottom",
      },
      {
        ...BASE_STEP,
        id: "sections",
        editorTab: "content",
        selector: "#tour-editor-sections",
        side: "left",
      },
      {
        ...BASE_STEP,
        id: "layout",
        editorTab: "layout",
        selector: "#tour-editor-layout",
        side: "left",
      },
      {
        ...BASE_STEP,
        id: "styling",
        editorTab: "styling",
        selector: "#tour-editor-styling",
        side: "left",
      },
      {
        ...BASE_STEP,
        id: "document",
        editorTab: "document",
        selector: "#tour-editor-document",
        side: "left",
      },
    ],
  },
  {
    // Small screens: the sidebar lives in a sheet, so the tab steps open it
    // first, then switch the tab, walking the same four tabs as desktop. They
    // point at the tab row: the sheet fills a phone, so a card beside a tab's
    // panel has no room and lands off screen.
    tour: EDITOR_SHEET_TOUR,
    steps: [
      {
        ...BASE_STEP,
        id: "preview",
        sheet: "closed",
        selector: "#tour-editor-preview",
      },
      {
        ...BASE_STEP,
        id: "readiness",
        sheet: "closed",
        selector: "#tour-editor-readiness",
        side: "bottom",
      },
      {
        ...BASE_STEP,
        id: "edit",
        sheet: "closed",
        selector: "#tour-editor-edit",
        side: "top-right",
      },
      {
        ...BASE_STEP,
        id: "sections",
        sheet: "open",
        editorTab: "content",
        selector: "#tour-editor-tabs",
        side: "bottom",
      },
      {
        ...BASE_STEP,
        id: "layout",
        sheet: "open",
        editorTab: "layout",
        selector: "#tour-editor-tabs",
        side: "bottom",
      },
      {
        ...BASE_STEP,
        id: "styling",
        sheet: "open",
        editorTab: "styling",
        selector: "#tour-editor-tabs",
        side: "bottom",
      },
      {
        ...BASE_STEP,
        id: "document",
        sheet: "open",
        editorTab: "document",
        selector: "#tour-editor-tabs",
        side: "bottom",
      },
    ],
  },
];
