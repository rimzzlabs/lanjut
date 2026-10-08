import { ResizablePanel } from "@lanjut/ui/components/resizable";
import { useSidebar } from "@lanjut/ui/components/sidebar";
import { EditorSidebarContent } from "./editor-sidebar-content";

export function EditorSidebar() {
  const { open } = useSidebar();

  return (
    <ResizablePanel
      defaultSize={open ? "36%" : "38%"}
      minSize={open ? "36%" : "32%"}
      maxSize={open ? "40%" : "48%"}
      style={{ overflow: "clip" }}
    >
      <EditorSidebarContent />
    </ResizablePanel>
  );
}
