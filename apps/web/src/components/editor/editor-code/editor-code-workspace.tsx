import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@lanjut/ui/components/resizable";
import type { ReactNode } from "react";
import { useCodeView } from "@/hooks/use-editor-mode";
import { EditorPreviewScroll } from "../editor-preview-scroll";
import { EditorCodeDiscard } from "./editor-code-discard";
import { EditorCodePane } from "./editor-code-pane";
import { EditorCodeToolbar } from "./editor-code-toolbar";

/** No section form is mounted here, so the text is the only writer. */
export function EditorCodeWorkspace(props: { children: ReactNode }) {
  const view = useCodeView();

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]">
      <EditorCodeToolbar />
      <div className="min-h-0">
        <EditorCodeDiscard />
        {view === "code" && <EditorCodePane />}
        {view === "preview" && (
          <EditorPreviewScroll>{props.children}</EditorPreviewScroll>
        )}
        {view === "split" && (
          <ResizablePanelGroup style={{ overflow: "clip" }}>
            <ResizablePanel defaultSize="50%" minSize="30%">
              <EditorCodePane />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel minSize="30%">
              <EditorPreviewScroll>{props.children}</EditorPreviewScroll>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
