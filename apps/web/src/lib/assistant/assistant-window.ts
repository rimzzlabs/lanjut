import type { Resume } from "@lanjut/resume";
import { getResume } from "@lanjut/resume/db";
import { O, R } from "@mobily/ts-belt";
import { isEditFrozen, isEditingHere } from "@/lib/edit-lock";
import { editorHref } from "@/lib/routes";
import { useEditLockStore } from "@/lib/store/edit-lock-store";
import { hasInvalidDraft } from "@/lib/store/editor-code-store";
import { useResumeStore } from "@/lib/store/resume-store";

/** What a tool call can do to the window, given by the bridge's component. */
export interface AssistantWindow {
  /** Moves the window to an app page, in its language. */
  go: (href: string) => Promise<void>;
  /** Tells the person that the assistant changed this résumé, and shows where. */
  changed: (before: Resume, written: Resume) => void;
}

/** The editor loads its code, the résumé, and its edit lock in this time. */
const OPEN_TIMEOUT_MS = 5000;

export const DRAFT_ERROR =
  "The code view of Lanjut shows a text with an error, which the person is still writing. Lanjut keeps it, so it refuses this call. Ask the person to fix the text or switch back to the form, then try again.";

export const UNREADABLE_RESUME =
  "Lanjut cannot read this résumé. Ask the person to open it in Lanjut.";

const FROZEN_ERROR =
  "Another Lanjut window edits this résumé. Ask the person to press Edit here in this window, then try again.";

/** The open résumé, when this window edits it. */
export function editedHere(id: string): O.Option<Resume> {
  const open = useResumeStore.getState().open;
  if (open?.id !== id || !isEditingHere("resume", id)) return O.None;
  return O.Some(open);
}

/**
 * None while the editor still loads. A "missing" status can be left from the
 * résumé before, so only the timeout ends a wait: `showResume` reads the
 * résumé first, so a résumé that cannot be read never gets here.
 */
function openState(id: string): O.Option<R.Result<Resume, string>> {
  const state = useResumeStore.getState();
  if (state.open?.id !== id || state.openStatus !== "ready") return O.None;
  if (isEditFrozen("resume", id)) return O.Some(R.makeError(FROZEN_ERROR));
  return O.map(editedHere(id), R.makeOk<Resume, string>);
}

/**
 * Resolves when the editor shows the résumé and holds its edit lock. Waiting
 * on the stores is a subscription to state that changes outside this call.
 */
function whenEditable(id: string): Promise<R.Result<Resume, string>> {
  return new Promise((resolve) => {
    const stop = () => {
      clearTimeout(timer);
      unsubscribeResume();
      unsubscribeLock();
    };
    const check = () => {
      const state = openState(id);
      if (O.isNone(state)) return;
      stop();
      resolve(state);
    };
    const timer = setTimeout(() => {
      stop();
      resolve(
        R.makeError("Lanjut did not open the résumé in time. Try again."),
      );
    }, OPEN_TIMEOUT_MS);
    const unsubscribeResume = useResumeStore.subscribe(check);
    const unsubscribeLock = useEditLockStore.subscribe(check);
    check();
  });
}

/**
 * Shows the résumé in the editor of this window and waits until this window
 * edits it. A move away from a résumé would drop a code text with an error,
 * so it is refused.
 */
export async function showResume(
  id: string,
  win: AssistantWindow,
): Promise<R.Result<Resume, string>> {
  const shown = editedHere(id);
  if (O.isSome(shown)) return R.makeOk(shown);
  if (hasInvalidDraft() && useResumeStore.getState().open?.id !== id) {
    return R.makeError(DRAFT_ERROR);
  }
  const stored = await getResume(id).catch(() => undefined);
  if (!stored) return R.makeError(UNREADABLE_RESUME);
  await win.go(editorHref(id));
  return whenEditable(id);
}
