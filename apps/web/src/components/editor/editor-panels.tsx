import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@lanjut/ui/components/resizable";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import type { ReactNode } from "react";
import { useEditorResume } from "@/hooks/use-editor-resume";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { EditorPreviewBar } from "./editor-preview-bar";
import { EditorReadiness } from "./editor-readiness/editor-readiness";
import { EditorResumeNotFound } from "./editor-resume-not-found";
import { EditorSheet } from "./editor-sheet";
import { EditorSidebar } from "./editor-sidebar";
import { EditorUndoRedo } from "./editor-undo-redo";
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
          <ResizablePanel minSize="40%">
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

// The readiness bar takes the first grid row and the page scrolls in the
// second, so the bar stays in view however far down the page is. The column
// is minmax(0,1fr): an auto column grows to the paper's width.
function EditorPreviewScroll(props: { children: ReactNode }) {
  return (
    <div
      id="tour-editor-preview"
      className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
    >
      <EditorPreviewBar>
        <div
          id="tour-editor-readiness"
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <EditorReadiness />
        </div>
        <div className="hidden xl:flex">
          <EditorUndoRedo />
        </div>
      </EditorPreviewBar>
      <ScrollArea className="h-full">
        <div className="bg-muted px-6 py-10 min-h-screen">{props.children}</div>
      </ScrollArea>
    </div>
  );
}
