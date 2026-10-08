import type { Locale } from "@lanjut/i18n/routing";
import { useCallback } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { usePathname } from "@/i18n/navigation";
import { IS_DESKTOP } from "@/lib/build-target";
import { resumeDetails } from "@/lib/feedback/feedback-details";
import type { FeedbackWindowOptions } from "@/lib/feedback-window";
import { areaForPathname } from "@/lib/github-issue";
import {
  type OpenFeedbackOptions,
  useFeedbackStore,
  useResumeStore,
} from "@/lib/store";

/**
 * Opens the feedback flow. The web app shows it in a sheet. The desktop app
 * cannot: it ships no server to file the issue, and the bot check will not
 * run on a non-web origin, so it opens the hosted page in a second window,
 * naming the area and the open résumé's look. That window needs the
 * network, so an offline user is told rather than handed an error page.
 */
export function useOpenFeedback() {
  const openFeedback = useFeedbackStore((state) => state.openFeedback);
  const pathname = usePathname();
  const editing = useWorkspaceView() === "editor";
  const locale = useLocale() as Locale;
  const t = useTranslations("feedback");

  return useCallback(
    (options: OpenFeedbackOptions = {}) => {
      if (!IS_DESKTOP) {
        openFeedback(options);
        return;
      }

      if (!navigator.onLine) {
        toast.error(t("offlineToast"));
        return;
      }

      const resume = useResumeStore.getState().open;
      void openFeedbackWindowLazily({
        kind: options.kind,
        area: options.area ?? areaForPathname(pathname, editing),
        locale,
        resume: editing ? resumeDetails(resume) : {},
      });
    },
    [openFeedback, pathname, editing, locale, t],
  );
}

async function openFeedbackWindowLazily(options: FeedbackWindowOptions) {
  const { openFeedbackWindow } = await import("@/lib/feedback-window");
  await openFeedbackWindow(options);
}
