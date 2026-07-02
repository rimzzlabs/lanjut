import { EditorSidebar } from "@/components/editor/editor-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditorLayoutPage(
  props: LayoutProps<"/platform/editor/[id]">,
) {
  return (
    <div className="h-[calc(100vh-4rem)] flex-1 overflow-hidden">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="68%" minSize="40%" maxSize="72%">
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="bg-muted px-6 py-10">{props.children}</div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <EditorSidebar />
      </ResizablePanelGroup>
    </div>
  );
}
