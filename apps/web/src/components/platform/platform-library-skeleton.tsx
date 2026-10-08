import { Card, CardHeader } from "@lanjut/ui/components/card";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { PlatformPaperFrame } from "./platform-paper-frame";

const START_KEYS = ["a", "b", "c", "d"];
const CARD_KEYS = ["a", "b", "c", "d"];

/**
 * The library while it reads the résumés: the continue card, the start
 * tiles, and the grid, each at its final size.
 */
export function PlatformLibrarySkeleton() {
  return (
    <>
      <section className="flex flex-col gap-3">
        <SectionHeadingSkeleton />
        <Card className="flex-row gap-0 p-1.5">
          <div className="w-28 shrink-0 sm:w-60">
            <PlatformPaperFrame>
              <Skeleton className="aspect-210/297 w-full rounded-none" />
            </PlatformPaperFrame>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4 px-4 py-2 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-9 w-36" />
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {START_KEYS.map((key) => (
            <Skeleton key={key} className="h-15 rounded-xl sm:h-19" />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
          {CARD_KEYS.map((key) => (
            <Card key={key} size="sm" className="gap-3 p-1.5 pb-3">
              <PlatformPaperFrame>
                <Skeleton className="aspect-210/297 w-full rounded-none" />
              </PlatformPaperFrame>
              <CardHeader className="px-2.5">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="flex h-5 items-center">
      <Skeleton className="h-3.5 w-32" />
    </div>
  );
}
