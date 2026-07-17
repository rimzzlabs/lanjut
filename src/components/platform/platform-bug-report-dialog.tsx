"use client";

import { useTranslations } from "next-intl";
import { useIssueReportStore } from "@/lib/store";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../shared/responsive-dialog";
import { TURNSTILE_SITE_KEY } from "../shared/turnstile";
import { PlatformBugReportForm } from "./platform-bug-report-form";

/**
 * Rendered once at the platform layout level, outside the sidebar: on mobile
 * the sidebar is a sheet that closes when this dialog opens, and a dialog
 * mounted inside it would be unmounted mid-open. Opened via useIssueReportStore.
 */
export function PlatformBugReportDialog() {
  const open = useIssueReportStore((state) => state.open);
  const setOpen = useIssueReportStore((state) => state.setOpen);
  const t = useTranslations("forms.bug");

  return (
    <ResponsiveDialog
      open={open === "bug"}
      onOpenChange={(next) => setOpen(next ? "bug" : null)}
    >
      <ResponsiveDialogContent className="flex max-h-[min(35rem,calc(100dvh-3rem))] flex-col gap-4 overflow-hidden sm:max-w-lg">
        <ResponsiveDialogHeader className="md:shrink-0">
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            {t(TURNSTILE_SITE_KEY ? "description" : "descriptionGitHubOnly")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <PlatformBugReportForm onSubmitted={() => setOpen(null)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
