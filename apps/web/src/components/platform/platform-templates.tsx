import { useTranslations } from "use-intl";
import { PlatformPageHeader } from "@/components/platform/platform-page-header";
import { PlatformTemplateGrid } from "@/components/platform/platform-template-grid/platform-template-grid";
import { PlatformTemplateToolbar } from "@/components/platform/platform-template-toolbar";
import { TourAutostart } from "@/components/tour/tour-autostart";
import { TEMPLATE_TOUR } from "@/lib/tour";

/** The template gallery, shown at `/template`. */
export function PlatformTemplates() {
  const t = useTranslations("platform.breadcrumb");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <PlatformPageHeader title={t("browseTemplates")} />
      <PlatformTemplateToolbar />
      <PlatformTemplateGrid />
      <TourAutostart tour={TEMPLATE_TOUR} />
    </div>
  );
}
