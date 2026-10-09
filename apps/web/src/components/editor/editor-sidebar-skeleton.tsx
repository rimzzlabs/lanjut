import { Skeleton } from "@lanjut/ui/components/skeleton";
import { EditorSectionListSkeleton } from "./editor-sections/ed-section-list-skeleton";

/** The side panel's tabs and section rows, as `EditorSidebarContent` lays them out. */
export function EditorSidebarSkeleton() {
  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2 py-6">
      <div className="px-4">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      <div className="min-h-0 overflow-clip">
        <div className="pt-2">
          <EditorSectionListSkeleton />
        </div>
      </div>
    </div>
  );
}

export function EditorIconButtonSkeleton() {
  return (
    <div className="grid size-8 place-items-center">
      <Skeleton className="size-4" />
    </div>
  );
}
