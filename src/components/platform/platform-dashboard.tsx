import { useTranslations } from "use-intl";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformLibraryTour } from "@/components/platform/platform-library-tour";
import { PlatformResumeGrid } from "@/components/platform/platform-resume-grid/platform-resume-grid";
import { PlatformResumeToolbar } from "@/components/platform/platform-resume-toolbar";
import { PlatformResumeUnreadableNotice } from "@/components/platform/platform-resume-unreadable-notice";

/** The résumé library: the workspace when no résumé is open. */
export function PlatformDashboard() {
  const t = useTranslations("platform.sidebar");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {t("myResume")}
        </h1>
      </header>
      <PlatformResumeToolbar />
      <PlatformResumeUnreadableNotice />
      <PlatformResumeGrid />
      <PlatformLibraryTour />
      <PlatformEmptyState />
    </div>
  );
}
