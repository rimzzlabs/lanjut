"use client";

import { ResizablePanel } from "../ui/resizable";
import { useSidebar } from "../ui/sidebar";
import { EditorSectionList } from "./editor-section-list";

export function EditorSidebar() {
  const { open } = useSidebar();
  return (
    <ResizablePanel
      defaultSize={open ? "32%" : "36%"}
      minSize={open ? "28%" : "30%"}
      maxSize="40%"
    >
      <div className="h-full overflow-y-auto px-6 py-5">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Resume</h2>
        <EditorSectionList />
      </div>
    </ResizablePanel>
  );
}
