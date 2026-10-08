import { TEMPLATES } from "@lanjut/resume/templates";
import { Card, CardFooter, CardHeader } from "@lanjut/ui/components/card";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";
import { PlatformPaperFrame } from "../platform-paper-frame";

/** One card per template, laid out as `PlatformTemplateGrid` lays them out. */
export function PlatformTemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),1fr))] gap-4">
      {TEMPLATES.map((template) => (
        <PlatformTemplateGridItemSkeleton key={template.id} />
      ))}
    </div>
  );
}

function PlatformTemplateGridItemSkeleton() {
  return (
    <Card size="sm" className="pt-0">
      <PlatformPaperFrame>
        <Skeleton className="aspect-210/297 w-full rounded-none" />
      </PlatformPaperFrame>

      <CardHeader>
        <Skeleton className="h-5.25 w-1/3" />
        <div className="flex flex-col">
          <DescriptionLineSkeleton width="w-full" />
          <DescriptionLineSkeleton width="w-3/5" />
        </div>
      </CardHeader>

      <CardFooter className="mt-auto">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

/** One line of the `text-xs` description: a 16px line box around the bar. */
function DescriptionLineSkeleton(props: { width: string }) {
  return (
    <div className="flex h-4 items-center">
      <Skeleton className={cn("h-3", props.width)} />
    </div>
  );
}
