"use client";

import { ResizablePanel } from "../ui/resizable";
import { useSidebar } from "../ui/sidebar";
import { EditorSidebarContent } from "./editor-sidebar-content";

export function EditorSidebar() {
  const { open } = useSidebar();

  return (
    <ResizablePanel
      defaultSize={open ? "36%" : "38%"}
      minSize={open ? "28%" : "30%"}
      maxSize="40%"
      style={{ maxHeight: "auto", height: "auto", overflow: "hidden" }}
    >
      <EditorSidebarContent />
    </ResizablePanel>
  );
}
