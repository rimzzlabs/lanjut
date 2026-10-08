import { useTranslations } from "use-intl";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformResumeGridSkeleton } from "./platform-resume-grid/platform-resume-grid-skeleton";
import { PlatformToolbarSkeleton } from "./platform-toolbar-skeleton";

/**
 * The library while its code loads. The grid is the one the library shows
 * while it reads the résumés, so the two hand over without a jump.
 */
export function PlatformDashboardSkeleton() {
  const t = useTranslations("platform.sidebar");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <PlatformPageHeader title={t("myResume")} />
      <PlatformToolbarSkeleton endClassName="w-24" />
      <PlatformResumeGridSkeleton />
    </div>
  );
}
