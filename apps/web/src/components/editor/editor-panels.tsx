import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@lanjut/ui/components/resizable";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import type { ReactNode } from "react";
import { useEditorResume } from "@/hooks/use-editor-resume";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { EditorResumeNotFound } from "./editor-resume-not-found";
import { EditorSheet } from "./editor-sheet";
import { EditorSidebar } from "./editor-sidebar";
import { EditorUndoShortcuts } from "./editor-undo-shortcuts";

// overflow-clip, not hidden: a hidden box can still be scrolled by code, and a
// tour's scrollIntoView would shift the whole editor out of place.
const PANELS_CONTAINER = "h-full min-h-0 overflow-clip";

export function EditorPanels(props: { children: ReactNode }) {
  const openStatus = useEditorResume();
  const isDesktop = useMediaQuery(MEDIA_XL);

  // No résumé, nothing to edit: the side panel, the edit sheet, and the undo
  // keys stay out, and the message takes the whole panel.
  if (openStatus === "missing") {
    return (
      <div className="grid h-full min-h-0 place-items-center overflow-clip p-6">
        <EditorResumeNotFound />
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className={PANELS_CONTAINER}>
        <EditorUndoShortcuts />
        <ResizablePanelGroup style={{ overflow: "clip" }}>
          <ResizablePanel defaultSize="68%" minSize="40%" maxSize="72%">
            <EditorPreviewScroll>{props.children}</EditorPreviewScroll>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <EditorSidebar />
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className={PANELS_CONTAINER}>
      <EditorUndoShortcuts />
      <EditorPreviewScroll>{props.children}</EditorPreviewScroll>
      {isDesktop === false && <EditorSheet />}
    </div>
  );
}

function EditorPreviewScroll(props: { children: ReactNode }) {
  return (
    <ScrollArea id="tour-editor-preview" className="h-full">
      <div className="bg-muted px-6 py-10 min-h-screen">{props.children}</div>
    </ScrollArea>
  );
}
