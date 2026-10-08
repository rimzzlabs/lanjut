import { useSidebar } from "@lanjut/ui/components/sidebar";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { cn } from "@lanjut/ui/lib/utils";
import { EditorPreviewSkeleton } from "./editor-preview-skeleton";
import { EditorSidebarSkeleton } from "./editor-sidebar-skeleton";

/**
 * The editor while its code loads. `EditorPanels` shows the same blank sheet
 * and section rows while it reads the résumé, so the two hand over without a
 * jump. The side panel shows from the `xl` breakpoint, as `MEDIA_XL` sets it,
 * at the width `EditorSidebar` opens with; below it, the Edit button that opens
 * the sheet.
 */
export function EditorWorkspaceSkeleton() {
  const { open } = useSidebar();

  return (
    <div className="flex h-full min-h-0 overflow-clip">
      <div className="min-w-0 flex-1 bg-muted px-6 py-10">
        <EditorPreviewSkeleton />
      </div>

      <div className="hidden w-px shrink-0 items-center justify-center bg-border xl:flex">
        <div className="h-6 w-1 shrink-0 rounded-lg bg-border" />
      </div>

      <div
        className={cn("hidden shrink-0 xl:block", open ? "w-[36%]" : "w-[38%]")}
      >
        <EditorSidebarSkeleton />
      </div>

      <Skeleton className="fixed right-4 bottom-4 z-40 h-10 w-17 bg-foreground/10 xl:hidden" />
    </div>
  );
}
