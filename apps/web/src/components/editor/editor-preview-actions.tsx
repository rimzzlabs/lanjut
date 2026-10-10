import { Separator } from "@lanjut/ui/components/separator";
import { EditorSectionOrderMenu } from "./editor-sections/ed-section-order-menu";
import { EditorUndoRedo } from "./editor-undo-redo";

/**
 * The preview bar's document actions, on every screen: undo and redo, then
 * the section order. A rule sets the order apart from the history controls.
 */
export function EditorPreviewActions() {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <EditorUndoRedo />
      <Separator orientation="vertical" className="h-4" />
      <EditorSectionOrderMenu />
    </div>
  );
}
