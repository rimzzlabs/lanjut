import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDERS = ["a", "b", "c", "d", "e", "f"];

export function PlatformResumeGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4">
      {PLACEHOLDERS.map((key) => (
        <Skeleton key={key} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}
