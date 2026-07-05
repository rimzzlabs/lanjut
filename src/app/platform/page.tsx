import type { Metadata } from "next";
import { Suspense } from "react";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformLibraryTour } from "@/components/platform/platform-library-tour";
import { PlatformResumeGrid } from "@/components/platform/platform-resume-grid/platform-resume-grid";
import { PlatformResumeToolbar } from "@/components/platform/platform-resume-toolbar";
import { PlatformResumeUnreadableNotice } from "@/components/platform/platform-resume-unreadable-notice";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function PlatformPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense>
        <PlatformResumeToolbar />
        <PlatformResumeUnreadableNotice />
        <PlatformResumeGrid />
        <PlatformLibraryTour />
      </Suspense>
      <PlatformEmptyState />
    </div>
  );
}
