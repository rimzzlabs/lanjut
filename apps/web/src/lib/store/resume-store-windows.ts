import { getResume, revisionOf } from "@lanjut/resume/db";
import { A, R } from "@mobily/ts-belt";
import { putResumeAnnounced } from "./announced-writes";
import {
  cancelOpenResumePersist,
  queueOpenWrite,
  refusedStatus,
} from "./persistence";
import { resetUndoHistory, useResumeStore } from "./resume-store";
import { syncIndexEntry } from "./resume-store-index";
import { useSaveStatusStore } from "./save-status-store";

// What this window does when another window got to a résumé first: it wrote
// it, deleted it, or took over its editing.

/**
 * Replaces the open document with its stored copy, as a fresh open does. The
 * forms remount, and what this window had not saved is dropped.
 */
export async function reloadOpenResume(): Promise<void> {
  const current = useResumeStore.getState().open;
  if (!current) return;
  cancelOpenResumePersist();
  const stored = await getResume(current.id).catch(() => undefined);
  if (!stored) {
    useSaveStatusStore.getState().setStatus("deleted");
    return;
  }
  resetUndoHistory();
  useResumeStore.setState((state) => ({
    open: stored,
    openRevision: revisionOf(stored),
    index: syncIndexEntry(state.index, stored),
    undoEpoch: state.undoEpoch + 1,
    canUndo: false,
    canRedo: false,
  }));
  useSaveStatusStore.getState().setStatus("saved");
}

/** Writes the open document back after another window deleted it. */
export async function restoreOpenResume(): Promise<void> {
  const open = useResumeStore.getState().open;
  if (!open) return;
  cancelOpenResumePersist();
  const saved = await queueOpenWrite(() => putResumeAnnounced(open, "new"));
  const { setStatus } = useSaveStatusStore.getState();
  R.match(
    saved,
    (written) => {
      useResumeStore.setState((state) => ({
        openRevision: revisionOf(written),
        index: syncIndexEntry(state.index, written),
      }));
      setStatus("saved");
    },
    (error) => setStatus(refusedStatus(error)),
  );
}

/**
 * Drops the open document without writing it, and from the index, after
 * another window deleted it. Call it after leaving the editor.
 */
export function closeOpenResume(): void {
  const open = useResumeStore.getState().open;
  cancelOpenResumePersist();
  resetUndoHistory();
  useResumeStore.setState((state) => ({
    index: A.reject(state.index, (item) => item.id === open?.id),
    open: null,
    openRevision: 0,
    openStatus: "idle",
    canUndo: false,
    canRedo: false,
  }));
  useSaveStatusStore.getState().setStatus("saved");
}

/** Another window saved this résumé: its library entry follows the stored copy. */
export async function syncResumeFromDisk(id: string): Promise<void> {
  const stored = await getResume(id).catch(() => undefined);
  if (!stored) return;
  useResumeStore.setState((state) => ({
    index: syncIndexEntry(state.index, stored),
  }));
}

/**
 * Another window deleted this résumé: it leaves the library, and a window
 * that has it open asks whether to restore it.
 */
export function forgetDeletedResume(id: string): void {
  useResumeStore.setState((state) => ({
    index: A.reject(state.index, (item) => item.id === id),
  }));
  if (useResumeStore.getState().open?.id !== id) return;
  cancelOpenResumePersist();
  useSaveStatusStore.getState().setStatus("deleted");
}
