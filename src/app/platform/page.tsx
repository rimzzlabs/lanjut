import type { Metadata } from "next";
import { Suspense } from "react";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformResumeGrid } from "@/components/platform/platform-resume-grid/platform-resume-grid";
import { PlatformResumeToolbar } from "@/components/platform/platform-resume-toolbar";
import { TourAutostart } from "@/components/tour/tour-autostart";
import { LIBRARY_TOUR } from "@/lib/tour";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function PlatformPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense>
        <PlatformResumeToolbar />
        <PlatformResumeGrid />
      </Suspense>
      <PlatformEmptyState />
      <TourAutostart tour={LIBRARY_TOUR} />
    </div>
  );
}
