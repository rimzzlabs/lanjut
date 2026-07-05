"use client";

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

  return (
    <ResponsiveDialog
      open={open === "feature"}
      onOpenChange={(next) => setOpen(next ? "feature" : null)}
    >
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Request a feature</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            This opens a prefilled GitHub issue for you to review and submit; a
            GitHub account is required. Note that résumé structure (tables,
            columns, images) is out of scope by design; presentation is fair
            game.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <PlatformFeatureRequestForm onSubmitted={() => setOpen(null)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
