import type { ReactNode } from "react";

/**
 * The strip above the page preview: the readiness meter, and from `xl` undo
 * and redo (below it they sit in the edit sheet). It stays in place while the
 * page scrolls under it, and spans the preview's full width, so the meter
 * starts at its left edge and undo and redo hold its right edge, however wide
 * a collapsed sidebar leaves the preview.
 */
export function EditorPreviewBar(props: { children: ReactNode }) {
  return (
    <div className="flex h-12 items-center gap-3 border-b bg-background px-4 md:px-6">
      {props.children}
    </div>
  );
}
