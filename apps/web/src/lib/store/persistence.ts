import type { Resume } from "@lanjut/resume";
import { type PutResumeError, putResume } from "@lanjut/resume/db";
import { A, F, R } from "@mobily/ts-belt";
import { type SaveStatus, useSaveStatusStore } from "./save-status-store";

/** The open résumé and the stored revision this window read or last wrote. */
export interface OpenCopy {
  resume: Resume;
  revision: number;
}

/**
 * The persist target is read lazily so this module and the store don't import
 * each other circularly; the store registers it at init.
 */
interface OpenPersistTarget {
  read: () => OpenCopy | null;
  /** Records a write that landed, so the next one expects its revision. */
  wrote: (written: Resume) => void;
}

function noOpenCopy(): OpenCopy | null {
  return null;
}

let target: OpenPersistTarget = { read: noOpenCopy, wrote: F.ignore };

export function setOpenPersistTarget(next: OpenPersistTarget): void {
  target = next;
}

const REFUSED_STATUS: Record<PutResumeError, SaveStatus> = {
  "newer-schema": "outdated",
  changed: "changed",
  deleted: "deleted",
};

/** The save status that a refused write leaves. */
export function refusedStatus(error: PutResumeError): SaveStatus {
  return REFUSED_STATUS[error];
}

/** Only a refresh or a choice ends these, so a further edit keeps them. */
const BLOCKED_STATUSES: ReadonlyArray<SaveStatus> = [
  "outdated",
  "changed",
  "deleted",
];

// Each write expects the revision that the one before it wrote, so writes of
// the open résumé run one after another, never side by side.
let queue: Promise<unknown> = Promise.resolve();

/** Runs a write of the open résumé after every write queued before it. */
export function queueOpenWrite<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(F.ignore);
  return run;
}

function writeOpen(): Promise<void> {
  const open = target.read();
  if (!open) return Promise.resolve();
  const { setStatus } = useSaveStatusStore.getState();
  return putResume(open.resume, open.revision).then(
    (result) =>
      R.match(
        result,
        (written) => {
          target.wrote(written);
          setStatus("saved");
        },
        (error) => setStatus(refusedStatus(error)),
      ),
    () => setStatus("failed"),
  );
}

function persistOpenNow(): Promise<void> {
  return queueOpenWrite(writeOpen);
}

/**
 * The single debounced whole-document write. Edits to the open Resume
 * schedule this; it collapses a burst of edits into one IndexedDB put ~500ms
 * after the last change. Leading is off so the first keystroke doesn't write.
 */
const controlled = F.makeControlledDebounce(
  () => {
    void persistOpenNow();
  },
  { delay: 500, leading: false },
);

export function scheduleOpenResumePersist(): void {
  const { status, setStatus } = useSaveStatusStore.getState();
  if (!A.includes(BLOCKED_STATUSES, status)) setStatus("saving");
  controlled.schedule();
}

/** Drops a pending write, when the open résumé is replaced or closed unsaved. */
export function cancelOpenResumePersist(): void {
  controlled.cancel();
}

/**
 * Flush a pending write immediately; called on resume-switch and page-hide so
 * the worst-case loss window stays bounded to edits made after the last flush.
 */
export async function flushOpenResumePersist(): Promise<void> {
  if (!controlled.isScheduled()) return;
  controlled.cancel();
  await persistOpenNow();
}

/**
 * Register the page-lifecycle flush safety net. Returns a cleanup. Intended to be
 * called once from a client provider effect; synchronizing with the browser's
 * lifecycle is a legitimate external-system effect.
 */
export function registerResumeFlushListeners(): () => void {
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") void flushOpenResumePersist();
  };
  const onPageHide = () => {
    void flushOpenResumePersist();
  };

  window.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);

  return () => {
    window.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", onPageHide);
  };
}
