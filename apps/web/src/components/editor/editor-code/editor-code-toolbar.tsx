import { EditorFormatSelect } from "./editor-format-select";
import { EditorModeSwitch } from "./editor-mode-switch";
import { EditorViewSwitch } from "./editor-view-switch";

/**
 * The strip above the code mode. The Form/Code switch is its first item, at
 * the place it has in the preview bar of the forms, so it does not move.
 */
export function EditorCodeToolbar() {
  return (
    <div className="flex h-12 items-center gap-2 border-b bg-background px-4 md:px-6">
      <EditorModeSwitch />
      <EditorViewSwitch />
      <div className="ml-auto">
        <EditorFormatSelect />
      </div>
    </div>
  );
}
