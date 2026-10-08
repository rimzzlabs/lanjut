import { TEMPLATES } from "@lanjut/resume/templates";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { useTranslations } from "use-intl";
import { EditorPreviewSkeleton } from "../editor/editor-preview-skeleton";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";

/** The template page while its code loads: the list beside a blank sheet. */
export function PlatformTemplatesSkeleton() {
  const t = useTranslations("platform.breadcrumb");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("browseTemplates")}>
        <Skeleton className="h-9 w-full sm:w-64" />
      </PlatformPageHeader>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {TEMPLATES.map((template) => (
            <Skeleton
              key={template.id}
              className="aspect-4/5 rounded-xl lg:aspect-auto lg:h-24"
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 max-lg:hidden">
          <div className="flex flex-col gap-2 p-3 sm:p-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-lg bg-muted/50 p-4 sm:p-8">
            <EditorPreviewSkeleton />
          </div>
        </div>
      </div>
    </PlatformPageScroll>
  );
}
