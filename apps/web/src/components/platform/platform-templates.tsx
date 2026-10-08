import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useTemplateSearchQuery } from "@/hooks/use-template-search";
import { TEMPLATE_TOUR } from "@/lib/tour";
import { TourAutostart } from "../tour/tour-autostart";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformTemplateBrowser } from "./platform-template-browser";

/** The template gallery, shown at `/template`. */
export function PlatformTemplates() {
  const t = useTranslations("platform");
  const [query, setQuery] = useTemplateSearchQuery();

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("breadcrumb.browseTemplates")}>
        <InputGroup id="tour-search-template" className="sm:w-64">
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("toolbar.searchTemplates")}
            aria-label={t("toolbar.searchTemplates")}
          />
        </InputGroup>
      </PlatformPageHeader>
      <PlatformTemplateBrowser />
      <TourAutostart tour={TEMPLATE_TOUR} />
    </PlatformPageScroll>
  );
}
