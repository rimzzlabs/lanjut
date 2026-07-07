"use client";

import type { ReactNode } from "react";
import { useEditorResume } from "@/hooks/use-editor-resume";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import { EditorSheet } from "./editor-sheet";
import { EditorSidebar } from "./editor-sidebar";

const PANELS_CONTAINER = "h-[calc(100svh-3rem-1px)] min-h-0 overflow-hidden";

export function EditorPanels(props: { children: ReactNode }) {
  useEditorResume();
  const isDesktop = useMediaQuery(MEDIA_XL);

  if (isDesktop) {
    return (
      <div className={PANELS_CONTAINER}>
        <ResizablePanelGroup style={{ overflow: "hidden" }}>
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
