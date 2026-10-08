import { EditorPageContent } from "./editor-page";
import { EditorPanels } from "./editor-panels";

/** The editor, shown at `/editor?id=<id>`. */
export function EditorWorkspace() {
  return (
    <EditorPanels>
      <EditorPageContent />
    </EditorPanels>
  );
}
