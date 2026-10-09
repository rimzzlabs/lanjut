import { Separator } from "@lanjut/ui/components/separator";
import { EditorSectionOrderReset } from "./editor-sections/ed-section-order-reset";
import { EditorUndoRedo } from "./editor-undo-redo";

/**
 * The preview bar's document actions, on every screen: undo and redo, then
 * resetting the section order. A rule sets the reset apart, because its
 * arrow looks much like undo's.
 */
export function EditorPreviewActions() {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <EditorUndoRedo />
      <Separator orientation="vertical" className="h-4" />
      <EditorSectionOrderReset />
    </div>
  );
}
