import { filterTemplates, SORTED_TEMPLATES } from "@lanjut/resume/templates";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";
import { A, O, pipe } from "@mobily/ts-belt";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import {
  useSelectedTemplate,
  useTemplateSearchQuery,
} from "@/hooks/use-template-search";
import { EditorPreviewSkeleton } from "../editor/editor-preview-skeleton";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformPaperFrame } from "./platform-paper-frame";
import { PlatformPaperSkeleton } from "./platform-paper-skeleton";
import { PlatformTemplateSearch } from "./platform-template-search";

/**
 * The template page while its code loads. The search, the names, and the
 * descriptions are real, in the order and the search the page will show;
 * only the pictures of the templates wait, as white paper. From `lg` it is
 * the list beside the chosen template's card, and below `lg` the cards.
 */
export function PlatformTemplatesSkeleton() {
  const t = useTranslations("platform");
  const [query] = useTemplateSearchQuery();
  const [selectedId] = useSelectedTemplate();
  const templates = filterTemplates(
    A.map(SORTED_TEMPLATES, (template) => ({
      ...template,
      description: t(`templates.descriptions.${template.id}`),
    })),
    query,
  );
  const selected = pipe(
    SORTED_TEMPLATES,
    A.find((template) => template.id === selectedId),
  );

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("breadcrumb.browseTemplates")}>
        <PlatformTemplateSearch />
      </PlatformPageHeader>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <ul className="flex flex-col gap-3 max-lg:hidden">
          {templates.map((template) => (
            <li
              key={template.id}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border bg-card p-3",
                template.id === selectedId &&
                  "border-primary ring-1 ring-primary",
              )}
            >
              <PlatformPaperSkeleton className="w-12 shrink-0 rounded-sm ring-1 ring-black/5" />
              <span className="flex min-w-0 flex-col gap-0.5 pr-6">
                <span className="truncate text-sm font-medium">
                  {template.name}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {template.description}
                </span>
              </span>
              {template.id === selectedId && (
                <CheckIcon
                  weight="bold"
                  className="absolute top-3 right-3 size-4 text-primary"
                />
              )}
            </li>
          ))}
        </ul>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex flex-col gap-2 rounded-xl bg-card p-1.5 pb-3 ring-1 ring-foreground/10"
            >
              <PlatformPaperFrame>
                <PlatformPaperSkeleton />
              </PlatformPaperFrame>
              <span className="flex min-w-0 flex-col gap-0.5 px-1.5">
                <span className="truncate text-sm font-medium">
                  {template.name}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {template.description}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 max-lg:hidden">
          <div className="flex items-center gap-4 border-b px-4 py-3">
            <span className="mr-auto text-lg font-semibold tracking-tight">
              {O.mapWithDefault(selected, "", (template) => template.name)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("templates.previewWith")}
            </span>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
          <p className="max-w-prose px-4 py-3 text-sm text-muted-foreground">
            {t(`templates.descriptions.${selectedId}`)}
          </p>
          <div className="rounded-lg bg-muted/50 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem] p-8">
            <EditorPreviewSkeleton />
          </div>
        </div>
      </div>
    </PlatformPageScroll>
  );
}
