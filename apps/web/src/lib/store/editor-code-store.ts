import type { Resume } from "@lanjut/resume";
import type { ParseInterchangeResult } from "@lanjut/resume/interchange";
import type { CodeFormat } from "@lanjut/resume/interchange/code-edit";
import { create } from "zustand";
import { useDeveloperModeStore } from "./developer-mode-store";
import { useEditorChromeStore } from "./editor-chrome-store";
import { useResumeStore } from "./resume-store";

export interface CodeDraft {
  text: string;
  format: CodeFormat;
  /** The open résumé as it was when this text was last read against it. */
  resume: Resume;
  /** Null until the first read of a new text comes back. */
  parsed: ParseInterchangeResult | null;
  /** Blocks of Markdown with no field in their section. They are left out. */
  ignored: number;
}

interface EditorCodeState {
  draft: CodeDraft | null;
  setDraft: (draft: CodeDraft | null) => void;
  /** What waits for the person to discard a text that has an error. */
  pending: (() => void) | null;
  setPending: (pending: (() => void) | null) => void;
}

export const useEditorCodeStore = create<EditorCodeState>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  pending: null,
  setPending: (pending) => set({ pending }),
}));

interface LiveDraftParams {
  draft: CodeDraft | null;
  open: Resume | null;
  format: CodeFormat;
}

/**
 * The draft, while it is about this résumé object. Any other write (undo, the
 * section order, another window) makes a new object, and the code then shows
 * the résumé again.
 */
export function liveDraft(params: LiveDraftParams): CodeDraft | null {
  const { draft, open, format } = params;
  if (!draft || draft.resume !== open || draft.format !== format) return null;
  return draft;
}

function hasInvalidDraft(): boolean {
  if (!isCodeModeOn()) return false;
  const draft = liveDraft({
    draft: useEditorCodeStore.getState().draft,
    open: useResumeStore.getState().open,
    format: useDeveloperModeStore.getState().format,
  });
  return draft?.parsed?.ok === false;
}

/** True while the code mode shows, read outside React. */
export function isCodeModeOn(): boolean {
  const enabled = useDeveloperModeStore.getState().enabled;
  return enabled && useEditorChromeStore.getState().mode === "code";
}

/** A text with an error was never applied, so the person confirms its loss first. */
export function runAfterCodeGuard(action: () => void) {
  if (!hasInvalidDraft()) {
    action();
    return;
  }
  useEditorCodeStore.getState().setPending(action);
}
