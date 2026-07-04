import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformPaperFrame } from "../platform-paper-frame";

const PLACEHOLDERS = ["a", "b", "c", "d", "e", "f"];

export function PlatformResumeGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,21rem),1fr))] gap-4">
      {PLACEHOLDERS.map((key) => (
        <Card key={key} size="sm" className="pt-0">
          <PlatformPaperFrame>
            <Skeleton className="aspect-210/297 w-full rounded-none" />
          </PlatformPaperFrame>

          <CardHeader>
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
