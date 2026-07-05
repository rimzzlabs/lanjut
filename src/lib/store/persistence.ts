import { F } from "@mobily/ts-belt";
import { putResume } from "@/lib/db";
import type { Resume } from "@/lib/resume";

/**
 * The persist target is read lazily so this module and the store don't import
 * each other circularly; the store registers its getter at init.
 */
type OpenResumeGetter = () => Resume | null;

let getOpenResume: OpenResumeGetter = () => null;

export function setOpenResumeGetter(getter: OpenResumeGetter): void {
  getOpenResume = getter;
}

async function persistOpenNow(): Promise<void> {
  const resume = getOpenResume();
  if (resume) await putResume(resume);
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
  controlled.schedule();
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
