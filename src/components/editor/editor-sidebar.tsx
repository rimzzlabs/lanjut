"use client";

import { ResizablePanel } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import { useSidebar } from "../ui/sidebar";
import { EditorSidebarContent } from "./editor-sidebar-content";

export function EditorSidebar() {
  const { open } = useSidebar();
  return (
    <ResizablePanel
      defaultSize={open ? "36%" : "38%"}
      minSize={open ? "28%" : "30%"}
      maxSize="40%"
    >
      <ScrollArea
        id="tour-editor-sections"
        className="max-h-[calc(100vh-3.5rem)]"
      >
        <EditorSidebarContent />
      </ScrollArea>
    </ResizablePanel>
  );
}
