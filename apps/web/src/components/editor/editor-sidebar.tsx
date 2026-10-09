import { ResizablePanel } from "@lanjut/ui/components/resizable";
import { useState } from "react";
import { EditorSidebarContent } from "./editor-sidebar-content";

const MIN_REM = 22;
const START_MAX_REM = 28;
// About the share of a laptop window the panel held when it was sized in %.
const START_SHARE = 0.29;

// The panel holds a width in rem, so a wide screen gives its extra room to the
// page preview, not to wider form fields. It starts near its old size on a
// laptop and never wider than 28rem; a drag still takes it to 40rem.
function startWidth(): string {
  const rem = (window.innerWidth * START_SHARE) / 16;
  return `${Math.min(START_MAX_REM, Math.max(MIN_REM, rem)).toFixed(1)}rem`;
}

export function EditorSidebar() {
  const [defaultSize] = useState(startWidth);

  return (
    <ResizablePanel
      defaultSize={defaultSize}
      minSize={`${MIN_REM}rem`}
      maxSize="40rem"
      groupResizeBehavior="preserve-pixel-size"
      style={{ overflow: "clip" }}
    >
      <EditorSidebarContent />
    </ResizablePanel>
  );
}
