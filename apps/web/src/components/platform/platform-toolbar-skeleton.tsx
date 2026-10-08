import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";

/** The search field on the left and one control on the right, as in each page's toolbar. */
export function PlatformToolbarSkeleton(props: { endClassName: string }) {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-full max-w-xs" />
      <Skeleton className={cn("ml-auto h-9 shrink-0", props.endClassName)} />
    </div>
  );
}
