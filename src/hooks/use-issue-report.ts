"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { usePathname } from "@/i18n/navigation";
import { IS_DESKTOP } from "@/lib/build-target";
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
  const locale = useLocale();
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

      void openFeedbackWindowLazily(kind, areaForPathname(pathname), locale);
    },
    [setOpen, pathname, locale, t],
  );
}

async function openFeedbackWindowLazily(
  kind: "bug" | "feature",
  area: ReturnType<typeof areaForPathname>,
  locale: string,
) {
  const { openFeedbackWindow } = await import("@/lib/feedback-window");
  await openFeedbackWindow({ kind, area, locale });
}
