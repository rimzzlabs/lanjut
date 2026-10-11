import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@lanjut/ui/components/resizable";
import type { ReactNode } from "react";
import { useEditorMode } from "@/hooks/use-editor-mode";
import { useEditorResume } from "@/hooks/use-editor-resume";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { EditorCodeWorkspace } from "./editor-code/editor-code-workspace";
import { EditorModeSwitch } from "./editor-code/editor-mode-switch";
import { EditorPreviewScroll } from "./editor-preview-scroll";
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
  const mode = useEditorMode();

  // No résumé, nothing to edit: the side panel, the edit sheet, and the undo
  // keys stay out, and the message takes the whole panel.
  if (openStatus === "missing") {
    return (
      <div className="grid h-full min-h-0 place-items-center overflow-clip p-6">
        <EditorResumeNotFound />
      </div>
    );
  }

  if (mode === "code") {
    return (
      <div className={PANELS_CONTAINER}>
        <EditorUndoShortcuts />
        <EditorCodeWorkspace>{props.children}</EditorCodeWorkspace>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className={PANELS_CONTAINER}>
        <EditorUndoShortcuts />
        <ResizablePanelGroup style={{ overflow: "clip" }}>
          <ResizablePanel minSize="40%">
            <EditorPreviewScroll lead={<EditorModeSwitch />}>
              {props.children}
            </EditorPreviewScroll>
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
      <EditorPreviewScroll lead={<EditorModeSwitch />}>
        {props.children}
      </EditorPreviewScroll>
      {isDesktop === false && <EditorSheet />}
    </div>
  );
}
