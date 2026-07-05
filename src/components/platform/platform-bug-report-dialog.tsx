"use client";

import { useBugReportStore } from "@/lib/store";
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
 * mounted inside it would be unmounted mid-open. Opened via useBugReportStore.
 */
export function PlatformBugReportDialog() {
  const open = useBugReportStore((state) => state.open);
  const setOpen = useBugReportStore((state) => state.setOpen);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Report a bug</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            This opens a prefilled GitHub issue for you to review and submit — a
            GitHub account is required, and your browser details are filled in
            for you.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <PlatformBugReportForm onSubmitted={() => setOpen(false)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
