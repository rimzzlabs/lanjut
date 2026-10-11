import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import type { ReactNode } from "react";
import { EditorPreviewActions } from "./editor-preview-actions";
import { EditorPreviewBar } from "./editor-preview-bar";
import { EditorReadiness } from "./editor-readiness/editor-readiness";

interface EditorPreviewScrollProps {
  children: ReactNode;
  /** A control at the bar's left edge. Nothing before it changes width, so it stays in place. */
  lead?: ReactNode;
}

// The readiness bar takes the first grid row and the page scrolls in the
// second, so the bar stays in view however far down the page is. The column
// is minmax(0,1fr): an auto column grows to the paper's width.
export function EditorPreviewScroll(props: EditorPreviewScrollProps) {
  return (
    <div
      id="tour-editor-preview"
      className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]"
    >
      <EditorPreviewBar>
        {props.lead}
        <div
          id="tour-editor-readiness"
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <EditorReadiness />
        </div>
        <EditorPreviewActions />
      </EditorPreviewBar>
      <ScrollArea className="h-full">
        <div className="bg-muted px-6 py-10 min-h-screen">{props.children}</div>
      </ScrollArea>
    </div>
  );
}
