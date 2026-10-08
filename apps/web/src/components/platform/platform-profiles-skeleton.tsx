import { Skeleton } from "@lanjut/ui/components/skeleton";
import { useTranslations } from "use-intl";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";

const ROW_KEYS = ["a", "b"];

/** The profiles page while its code loads. */
export function PlatformProfilesSkeleton() {
  const t = useTranslations("profile");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("profiles")}>
        <Skeleton className="h-9 w-40" />
      </PlatformPageHeader>
      <Skeleton className="-mt-2 h-4 w-full max-w-md" />
      <PlatformProfilesBodySkeleton />
    </PlatformPageScroll>
  );
}

/** The list and the profile card while the profiles load. */
export function PlatformProfilesBodySkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        {ROW_KEYS.map((key) => (
          <Skeleton key={key} className="h-17 rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 max-lg:hidden">
        <div className="flex items-center gap-4 border-b pb-6">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-2/3" />
      </div>
    </div>
  );
}
