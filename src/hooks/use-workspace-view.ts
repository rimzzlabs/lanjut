import { useEditorId } from "@/hooks/use-editor-id";

export type WorkspaceView = "library" | "editor";

/**
 * Which half of the workspace shows: the résumé library, or the editor when the
 * address names a résumé.
 */
export function useWorkspaceView(): WorkspaceView {
  return useEditorId() === undefined ? "library" : "editor";
}
