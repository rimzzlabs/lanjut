import type { Locale } from "@lanjut/i18n/routing";
import { useCallback } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { usePathname } from "@/i18n/navigation";
import { IS_DESKTOP } from "@/lib/build-target";
import type { FeedbackWindowOptions } from "@/lib/feedback-window";
import { areaForPathname } from "@/lib/github-issue";
import { useIssueReportStore } from "@/lib/store";

/**
 * Opens the bug report or feature request surface. The web app has the form in a
 * dialog. The desktop app cannot: it ships no server to file the issue, and the
 * form's bot check will not run on a non-web origin, so it opens the hosted form
 * in a second window instead. That window needs the network, so an offline user
 * is told rather than handed an error page.
 */
export function useIssueReport() {
  const setOpen = useIssueReportStore((state) => state.setOpen);
  const pathname = usePathname();
  const editing = useWorkspaceView() === "editor";
  const locale = useLocale() as Locale;
  const t = useTranslations("feedback");

  return useCallback(
    (kind: "bug" | "feature") => {
      if (!IS_DESKTOP) {
        setOpen(kind);
        return;
      }

      if (!navigator.onLine) {
        toast.error(t("offlineToast"));
        return;
      }

      void openFeedbackWindowLazily({
        kind,
        area: areaForPathname(pathname, editing),
        locale,
      });
    },
    [setOpen, pathname, editing, locale, t],
  );
}

async function openFeedbackWindowLazily(options: FeedbackWindowOptions) {
  const { openFeedbackWindow } = await import("@/lib/feedback-window");
  await openFeedbackWindow(options);
}
