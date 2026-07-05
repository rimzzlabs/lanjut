import type { Metadata } from "next";
import { Suspense } from "react";
import { PlatformTemplateGrid } from "@/components/platform/platform-template-grid/platform-template-grid";
import { PlatformTemplateToolbar } from "@/components/platform/platform-template-toolbar";
import { TourAutostart } from "@/components/tour/tour-autostart";
import { TEMPLATE_TOUR } from "@/lib/tour";

export const metadata: Metadata = {
  title: "Browse templates",
};

export default function PlatformTemplatePage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense>
        <PlatformTemplateToolbar />
        <PlatformTemplateGrid />
      </Suspense>
      <TourAutostart tour={TEMPLATE_TOUR} />
    </div>
  );
}
