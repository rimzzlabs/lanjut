import { Skeleton } from "@lanjut/ui/components/skeleton";
import { useTranslations } from "use-intl";
import { PlatformLibrarySkeleton } from "./platform-library-skeleton";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";

/**
 * The library while its code loads. The body is the one the library shows
 * while it reads the résumés, so the two hand over without a jump.
 */
export function PlatformDashboardSkeleton() {
  const t = useTranslations("platform.sidebar");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("myResume")}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 flex-1 sm:w-64 sm:flex-none" />
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>
      </PlatformPageHeader>
      <PlatformLibrarySkeleton />
    </PlatformPageScroll>
  );
}
