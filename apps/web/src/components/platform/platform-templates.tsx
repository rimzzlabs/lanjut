import { useTranslations } from "use-intl";
import { useTemplateGuideLink } from "@/hooks/use-template-guide-link";
import { TEMPLATE_TOUR } from "@/lib/tour";
import { TourAutostart } from "../tour/tour-autostart";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformTemplateBrowser } from "./platform-template-browser";
import { PlatformTemplateSearch } from "./platform-template-search";

/** The template gallery, shown at `/template`. */
export function PlatformTemplates() {
  const t = useTranslations("platform.templates");
  const guideLink = useTemplateGuideLink();

  return (
    <PlatformPageScroll>
      <PlatformPageHeader
        title={t("heading")}
        description={t("intro")}
        descriptionLink={guideLink}
      >
        <PlatformTemplateSearch />
      </PlatformPageHeader>
      <PlatformTemplateBrowser />
      <TourAutostart tour={TEMPLATE_TOUR} />
    </PlatformPageScroll>
  );
}
