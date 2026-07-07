import type { Step } from "nextstepjs";

export const LIBRARY_TOUR = "library";
export const TEMPLATE_TOUR = "template";
export const EDITOR_TOUR = "editor";
export const EDITOR_SHEET_TOUR = "editor-sheet";

export type TourName =
  | typeof LIBRARY_TOUR
  | typeof TEMPLATE_TOUR
  | typeof EDITOR_TOUR
  | typeof EDITOR_SHEET_TOUR;

export interface AppStep extends Step {
  sidebar?: "open" | "closed";
  scrollTop?: boolean;
}

export interface AppStepMeta extends Omit<AppStep, "title" | "content"> {
  id: string;
}

export interface AppTourMeta {
  tour: TourName;
  steps: AppStepMeta[];
}

export interface AppTour {
  tour: TourName;
  steps: AppStep[];
}

export function tourForPathname(pathname: string): TourName {
  if (pathname.startsWith("/platform/editor")) return EDITOR_TOUR;
  if (pathname.startsWith("/platform/template")) return TEMPLATE_TOUR;
  return LIBRARY_TOUR;
}

export function getTourStep(
  tourName: string | null,
  stepIndex: number,
): AppStepMeta | undefined {
  const tour = TOUR_STEPS.find((t) => t.tour === tourName);
  return tour?.steps[stepIndex];
}

export function localizeTours(t: (key: string) => string): AppTour[] {
  return TOUR_STEPS.map((tour) => ({
    tour: tour.tour,
    steps: tour.steps.map((step) => ({
      ...step,
      title: t(`${tour.tour}.${step.id}.title`),
      content: t(`${tour.tour}.${step.id}.content`),
    })),
  }));
}

const BASE_STEP = {
  icon: null,
  showControls: true,
  showSkip: true,
  pointerPadding: 12,
  pointerRadius: 16,
} satisfies Partial<Step>;

// Library and template targets all sit at the top of a window-scrolled page.
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
      },
      {
        ...TOP_STEP,
        id: "resumes",
        sidebar: "open",
        selector: "#tour-sidebar-resumes",
        side: "right",
      },
      {
        ...TOP_STEP,
        id: "replay",
        sidebar: "open",
        selector: "#tour-guide",
        side: "right",
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
        selector: "#tour-template-grid > :first-child",
        side: "right",
      },
      {
        ...TOP_STEP,
        id: "search",
        sidebar: "closed",
        selector: "#tour-search-template",
        side: "bottom-left",
      },
      {
        ...TOP_STEP,
        id: "sort",
        sidebar: "closed",
        selector: "#tour-sort-template",
        side: "bottom-right",
      },
    ],
  },
  {
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
        id: "sections",
        selector: "#tour-editor-sections",
        side: "left",
      },
      {
        ...BASE_STEP,
        id: "download",
        selector: "#tour-download",
        side: "bottom-right",
      },
    ],
  },
  {
    tour: EDITOR_SHEET_TOUR,
    steps: [
      { ...BASE_STEP, id: "preview", sidebar: "closed" },
      {
        ...BASE_STEP,
        id: "edit",
        sidebar: "closed",
        selector: "#tour-editor-edit",
        side: "top-right",
      },
    ],
  },
];
