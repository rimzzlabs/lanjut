import { Suspense } from "react";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformResumeGrid } from "@/components/platform/platform-resume-grid/platform-resume-grid";
import { PlatformResumeToolbar } from "@/components/platform/platform-resume-toolbar";

export default function PlatformPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense>
        <PlatformResumeToolbar />
        <PlatformResumeGrid />
      </Suspense>
      <PlatformEmptyState />
    </div>
  );
}
