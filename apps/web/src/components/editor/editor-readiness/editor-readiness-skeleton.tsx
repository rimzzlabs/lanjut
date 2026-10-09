import { Skeleton } from "@lanjut/ui/components/skeleton";

/** The readiness meter while the résumé loads, at the size it renders with. */
export function EditorReadinessSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-1.5 flex-1 rounded-full" />
    </>
  );
}
