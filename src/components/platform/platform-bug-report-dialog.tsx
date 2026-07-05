"use client";

import { useIssueReportStore } from "@/lib/store";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../shared/responsive-dialog";
import { PlatformBugReportForm } from "./platform-bug-report-form";

/**
 * Rendered once at the platform layout level, outside the sidebar: on mobile
 * the sidebar is a sheet that closes when this dialog opens, and a dialog
 * mounted inside it would be unmounted mid-open. Opened via useIssueReportStore.
 */
export function PlatformBugReportDialog() {
  const open = useIssueReportStore((state) => state.open);
  const setOpen = useIssueReportStore((state) => state.setOpen);

  return (
    <ResponsiveDialog
      open={open === "bug"}
      onOpenChange={(next) => setOpen(next ? "bug" : null)}
    >
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Report a bug</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            This opens a prefilled GitHub issue for you to review and submit; a
            GitHub account is required, and your browser details are filled in
            for you.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <PlatformBugReportForm onSubmitted={() => setOpen(null)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
