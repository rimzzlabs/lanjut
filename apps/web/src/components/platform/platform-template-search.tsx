import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useTemplateSearchQuery } from "@/hooks/use-template-search";

/** The template search in the page header, shown while the page loads too. */
export function PlatformTemplateSearch() {
  const t = useTranslations("platform.toolbar");
  const [query, setQuery] = useTemplateSearchQuery();

  return (
    <InputGroup id="tour-search-template" className="sm:w-64">
      <InputGroupAddon>
        <MagnifyingGlassIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchTemplates")}
        aria-label={t("searchTemplates")}
      />
    </InputGroup>
  );
}
