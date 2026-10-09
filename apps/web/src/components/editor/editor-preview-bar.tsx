import type { ReactNode } from "react";

/**
 * The strip above the page preview: the readiness meter, and from `xl` undo
 * and redo (below it they sit in the edit sheet). It stays in place while the
 * page scrolls under it, and its content spans the paper's own width, so the
 * meter lines up with the page.
 */
export function EditorPreviewBar(props: { children: ReactNode }) {
  return (
    <div className="border-b bg-background px-6">
      <div className="mx-auto flex h-12 w-full max-w-198.5 items-center gap-3">
        {props.children}
      </div>
    </div>
  );
}
