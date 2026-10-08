import { Skeleton } from "@lanjut/ui/components/skeleton";
import { EditorSectionListSkeleton } from "./editor-sections/ed-section-list-skeleton";

/** The side panel's tabs, undo and redo, and section rows, as `EditorSidebarContent` lays them out. */
export function EditorSidebarSkeleton() {
  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-2 py-6">
      <div className="flex items-center gap-2 px-4">
        <Skeleton className="h-9 w-53 rounded-lg" />
        <div className="ml-auto flex items-center">
          <IconButtonSkeleton />
          <IconButtonSkeleton />
        </div>
      </div>

      <div className="min-h-0 overflow-clip">
        <div className="flex justify-end px-4 pt-4">
          <IconButtonSkeleton />
        </div>
        <EditorSectionListSkeleton />
      </div>
    </div>
  );
}

function IconButtonSkeleton() {
  return (
    <div className="grid size-8 place-items-center">
      <Skeleton className="size-4" />
    </div>
  );
}
