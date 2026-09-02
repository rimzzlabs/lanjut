"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/lib/store";

/**
 * Text inputs and the rich-text editors keep their own native or TipTap
 * history; the document-level shortcut only fires when neither has focus.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest("input, textarea, [contenteditable=true]") !== null;
}

export function EditorUndoShortcuts() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      const isUndo = key === "z" && !event.shiftKey;
      const isRedo = (key === "z" && event.shiftKey) || key === "y";
      if (!isUndo && !isRedo) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      const store = useResumeStore.getState();
      if (isUndo) store.undo();
      else store.redo();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
