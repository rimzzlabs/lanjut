"use client";

import { ResizablePanel } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import { useSidebar } from "../ui/sidebar";
import { EditorSectionList } from "./editor-sections/ed-section-list";

export function EditorSidebar() {
  const { open } = useSidebar();
  return (
    <ResizablePanel
      defaultSize={open ? "36%" : "38%"}
      minSize={open ? "28%" : "30%"}
      maxSize="40%"
    >
      <ScrollArea className="max-h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col py-6">
          <h2 className="pb-1 text-2xl font-bold tracking-tight px-4">
            Editor
          </h2>
          <h3 className="pb-2 text-lg font-semibold tracking-tight px-4">
            The Essentials
          </h3>
          <EditorSectionList />
        </div>
      </ScrollArea>
    </ResizablePanel>
  );
}
