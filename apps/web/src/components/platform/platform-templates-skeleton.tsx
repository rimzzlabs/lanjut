import { useTranslations } from "use-intl";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformTemplateGridSkeleton } from "./platform-template-grid/platform-template-grid-skeleton";
import { PlatformToolbarSkeleton } from "./platform-toolbar-skeleton";

/** The template gallery while its code loads. */
export function PlatformTemplatesSkeleton() {
  const t = useTranslations("platform.breadcrumb");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <PlatformPageHeader title={t("browseTemplates")} />
      <PlatformToolbarSkeleton endClassName="w-40" />
      <PlatformTemplateGridSkeleton />
    </div>
  );
}
