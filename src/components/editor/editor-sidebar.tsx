"use client";

import { ResizablePanel } from "../ui/resizable";
import { useSidebar } from "../ui/sidebar";

export function EditorSidebar() {
  const { open } = useSidebar();
  return (
    <ResizablePanel
      defaultSize={open ? "32%" : "36%"}
      minSize={open ? "28%" : "30%"}
      maxSize="40%"
    >
      <div className="h-full overflow-y-auto p-4">
        <div className="inline-flex items-center gap-2">
          <h3 className="text-lg font-medium">Editor</h3>
        </div>
      </div>
    </ResizablePanel>
  );
}
