import { useMemo } from "react";
import { useLocale } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { usePathname } from "@/i18n/navigation";
import {
  pageName,
  resumeDetails,
  webDetails,
} from "@/lib/feedback/feedback-details";
import type {
  FeedbackArea,
  FeedbackDetails,
  WordingLanguage,
} from "@/lib/feedback/feedback-schema";
import { areaForPathname } from "@/lib/github-issue";
import { useResumeStore } from "@/lib/store";
import { useFeedbackLaunch } from "./use-feedback-params";

export interface FeedbackContext {
  area: FeedbackArea;
  details: FeedbackDetails;
}

/**
 * What the app knows when feedback opens inside it: the page, the build and
 * browser, and, in the editor, the open résumé's template, font, and
 * language. Never the résumé's text.
 */
export function useAppFeedbackContext(): FeedbackContext {
  const pathname = usePathname();
  const editing = useWorkspaceView() === "editor";
  const locale = useLocale() as WordingLanguage;
  const resume = useResumeStore((state) => state.open);

  return useMemo(
    () => ({
      area: areaForPathname(pathname, editing),
      details: {
        ...webDetails(locale),
        page: pageName(pathname, editing),
        ...(editing ? resumeDetails(resume) : {}),
      },
    }),
    [pathname, editing, locale, resume],
  );
}

/**
 * What the /feedback page knows: its own browser, plus whatever its opener
 * named in the address. The desktop app names its build, its system, and the
 * open résumé's look, since this page runs in a separate window.
 */
export function usePageFeedbackContext(): FeedbackContext {
  const launch = useFeedbackLaunch();
  const locale = useLocale() as WordingLanguage;

  return useMemo(
    () => ({
      area: launch.area ?? "other",
      details: {
        ...webDetails(locale),
        ...(launch.fromDesktop ? { browser: "WebKit (Mac app window)" } : {}),
        ...launch.details,
      },
    }),
    [launch, locale],
  );
}
