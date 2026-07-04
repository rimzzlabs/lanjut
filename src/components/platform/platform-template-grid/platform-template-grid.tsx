"use client";

import {
  useTemplateSearchQuery,
  useTemplateSort,
} from "@/hooks/use-template-search";
import { filterTemplates, sortTemplates, TEMPLATES } from "@/lib/templates";
import { PlatformTemplateGridItem } from "./platform-template-grid-item";

export function PlatformTemplateGrid() {
  const [query] = useTemplateSearchQuery();
  const [sort] = useTemplateSort();

  const results = sortTemplates(filterTemplates(TEMPLATES, query), sort);

  if (results.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No templates match “{query.trim()}”.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
      {results.map((template) => (
        <PlatformTemplateGridItem key={template.id} template={template} />
      ))}
    </div>
  );
}
