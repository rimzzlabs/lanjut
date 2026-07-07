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
import { PlatformFeatureRequestForm } from "./platform-feature-request-form";

/**
 * Rendered once at the platform layout level, outside the sidebar: on mobile
 * the sidebar is a sheet that closes when this dialog opens, and a dialog
 * mounted inside it would be unmounted mid-open. Opened via useIssueReportStore.
 */
export function PlatformFeatureRequestDialog() {
  const open = useIssueReportStore((state) => state.open);
  const setOpen = useIssueReportStore((state) => state.setOpen);
  const t = useTranslations("forms.feature");

  return (
    <ResponsiveDialog
      open={open === "feature"}
      onOpenChange={(next) => setOpen(next ? "feature" : null)}
    >
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            {t("description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <PlatformFeatureRequestForm onSubmitted={() => setOpen(null)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
