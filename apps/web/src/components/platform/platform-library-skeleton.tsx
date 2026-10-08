import { Card, CardHeader } from "@lanjut/ui/components/card";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { A, F } from "@mobily/ts-belt";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { useProfileResumeCount } from "@/hooks/use-profile-resumes";
import { type LibraryView, useLibraryViewStore } from "@/lib/store";
import { PlatformLibraryEmpty } from "./platform-library-empty";
import { PlatformLibraryStart } from "./platform-library-start/platform-library-start";
import { PlatformPaperFrame } from "./platform-paper-frame";
import { PlatformPaperSkeleton } from "./platform-paper-skeleton";
import { PlatformSectionHeading } from "./platform-section-heading";

const MAX_CARDS = 8;

/**
 * The library while it loads. Everything that needs no data is real: the
 * headings and the start tiles. Once the résumés are counted (the sidebar
 * reads them while the library's code loads), the rest takes the shape the
 * library will have: the continue card only with a résumé, and the list of
 * all résumés only with more than one, in the chosen view.
 */
export function PlatformLibrarySkeleton() {
  const count = useProfileResumeCount();

  if (count === 0) return <PlatformLibraryEmpty />;

  return (
    <>
      <PlatformLibraryContinueSkeleton />
      <PlatformLibraryStart />
      {count !== null && count > 1 && (
        <PlatformResumeCollectionSkeleton count={Math.min(count, MAX_CARDS)} />
      )}
    </>
  );
}

function PlatformLibraryContinueSkeleton() {
  const t = useTranslations("platform.library");
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <PlatformSectionHeading id={headingId}>
        {t("continue")}
      </PlatformSectionHeading>
      <Card className="flex-row gap-0 p-1.5">
        <div className="w-28 shrink-0 sm:w-60">
          <PlatformPaperFrame>
            <PlatformPaperSkeleton />
          </PlatformPaperFrame>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-4 py-2 sm:justify-between sm:px-6 sm:py-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex items-center gap-2 max-md:hidden">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="size-9" />
          </div>
        </div>
      </Card>
    </section>
  );
}

function PlatformResumeCollectionSkeleton(props: { count: number }) {
  const t = useTranslations("platform.library");
  const headingId = useId();
  const view = useLibraryViewStore((state) => state.view);
  const keys = A.makeWithIndex(props.count, F.identity);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <PlatformSectionHeading id={headingId}>
          {t("all")}
        </PlatformSectionHeading>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-7.5 w-28 rounded-2xl" />
        </div>
      </div>
      <PlatformResumeCollectionSkeletonItems view={view} keys={keys} />
    </section>
  );
}

function PlatformResumeCollectionSkeletonItems(props: {
  view: LibraryView;
  keys: ReadonlyArray<number>;
}) {
  if (props.view === "list") {
    return (
      <ul className="flex flex-col gap-1 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10">
        {props.keys.map((key) => (
          <li key={key} className="flex items-center gap-2.5 p-1.5 pr-2">
            <PlatformPaperSkeleton className="w-10 shrink-0 rounded-sm shadow-xs ring-1 ring-black/5" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="size-8" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
      {props.keys.map((key) => (
        <Card key={key} size="sm" className="gap-3 p-1.5 pb-3">
          <PlatformPaperFrame>
            <PlatformPaperSkeleton />
          </PlatformPaperFrame>
          <CardHeader className="px-2.5">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
