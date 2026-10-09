import { useTranslations } from "use-intl";
import { PlatformLibrarySkeleton } from "./platform-library-skeleton";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformResumeToolbar } from "./platform-resume-toolbar";

/**
 * The library while its code loads. The header and its toolbar are real, and
 * the body is the one the library shows while it reads the résumés, so the
 * two hand over without a jump.
 */
export function PlatformDashboardSkeleton() {
  const t = useTranslations("platform.sidebar");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("myResume")}>
        <PlatformResumeToolbar withSheet={false} />
      </PlatformPageHeader>
      <PlatformLibrarySkeleton />
    </PlatformPageScroll>
  );
}
