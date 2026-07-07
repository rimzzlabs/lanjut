"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useTemplateSearchQuery,
  useTemplateSort,
} from "@/hooks/use-template-search";
import type { TemplateSort } from "@/lib/templates";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SORT_OPTIONS: { value: TemplateSort; labelKey: string }[] = [
  { value: "name-asc", labelKey: "sortNameAsc" },
  { value: "name-desc", labelKey: "sortNameDesc" },
  { value: "newest", labelKey: "sortNewest" },
];

export function PlatformTemplateToolbar() {
  const [query, setQuery] = useTemplateSearchQuery();
  const [sort, setSort] = useTemplateSort();
  const t = useTranslations("platform.toolbar");
  const options = SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <div className="flex items-center gap-2">
      <InputGroup id="tour-search-template" className="max-w-xs">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchTemplates")}
        />
      </InputGroup>

      <div id="tour-sort-template" className="ml-auto">
        <Select
          items={options}
          value={sort}
          onValueChange={(value) => setSort(value as TemplateSort)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
