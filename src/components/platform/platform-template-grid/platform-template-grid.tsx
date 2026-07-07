"use client";

import { useTranslations } from "next-intl";
import {
  useTemplateSearchQuery,
  useTemplateSort,
} from "@/hooks/use-template-search";
import { filterTemplates, sortTemplates, TEMPLATES } from "@/lib/templates";
import { PlatformTemplateGridItem } from "./platform-template-grid-item";

export function PlatformTemplateGrid() {
  const [query] = useTemplateSearchQuery();
  const [sort] = useTemplateSort();
  const t = useTranslations("platform.templates");

  const localized = TEMPLATES.map((template) => ({
    ...template,
    description: t(`descriptions.${template.id}`),
  }));
  const results = sortTemplates(filterTemplates(localized, query), sort);

  if (results.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("noMatch", { query: query.trim() })}
      </p>
    );
  }

  return (
    <div
      id="tour-template-grid"
      className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),1fr))] gap-4"
    >
      {results.map((template) => (
        <PlatformTemplateGridItem key={template.id} template={template} />
      ))}
    </div>
  );
}
