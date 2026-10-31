import { useTranslations } from "use-intl";
import { TEMPLATE_TOUR } from "@/lib/tour";
import { TourAutostart } from "../tour/tour-autostart";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformTemplateBrowser } from "./platform-template-browser";
import { PlatformTemplateSearch } from "./platform-template-search";

/** The template gallery, shown at `/template`. */
export function PlatformTemplates() {
  const t = useTranslations("platform.templates");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("heading")} description={t("intro")}>
        <PlatformTemplateSearch />
      </PlatformPageHeader>
      <PlatformTemplateBrowser />
      <TourAutostart tour={TEMPLATE_TOUR} />
    </PlatformPageScroll>
  );
}
