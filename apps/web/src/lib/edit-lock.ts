/**
 * One window edits a résumé or a profile at a time. The window that holds the
 * item's Web Lock edits it, and every other window that has it open is frozen
 * until its person asks to edit there. The revision check on each write
 * (`writeRevised`) stays the second guard, for a window this lock cannot
 * reach: an older build, or a write that lands after a steal.
 */
import { D, F, O, pipe } from "@mobily/ts-belt";
import { type EditLockStatus, useEditLockStore } from "./store/edit-lock-store";
import { type EditKind, postWindowMessage } from "./window-channel";

/** A window that does not answer a handover in this time loses the lock anyway. */
const STEAL_AFTER_MS = 2000;

export interface EditLockHooks {
  /** Writes what is pending, before this window gives the item up. */
  beforeRelease?: () => Promise<void>;
  /** Reads the stored copy again, after this window takes the item over. */
  afterTake?: () => Promise<void>;
}

interface Entry {
  /** The mounted views of the item in this window. The lock goes with the last. */
  users: number;
  hooks: EditLockHooks;
  /** Lets the lock go. Set only while this window holds it. */
  release: (() => void) | null;
  /** Stops the wait of a takeover. Set only while one waits. */
  waiting: AbortController | null;
}

let entries: Readonly<Record<string, Entry>> = {};
// The last lock request per item. A new request waits for it, because a lock
// that this window let go is not free again until that request settles.
let requests: Readonly<Record<string, Promise<void>>> = {};

export function editLockKey(kind: EditKind, id: string): string {
  return `lanjut:${kind}:${id}`;
}

/** Whether another window edits this item, so this one must not change it. */
export function isEditFrozen(kind: EditKind, id: string): boolean {
  return pipe(
    D.get(useEditLockStore.getState().statuses, editLockKey(kind, id)),
    O.mapWithDefault(false, (status) => status !== "editing"),
  );
}

/** Whether this window is the one that edits this item. */
export function isEditingHere(kind: EditKind, id: string): boolean {
  const statuses = useEditLockStore.getState().statuses;
  return D.get(statuses, editLockKey(kind, id)) === "editing";
}

function supported(): boolean {
  return typeof navigator !== "undefined" && "locks" in navigator;
}

function setStatus(key: string, status: EditLockStatus): void {
  useEditLockStore.setState((state) => ({
    statuses: D.set(state.statuses, key, status),
  }));
}

function patch(key: string, change: Partial<Entry>): void {
  entries = pipe(
    D.get(entries, key),
    O.mapWithDefault(entries, (entry) =>
      D.set(entries, key, { ...entry, ...change }),
    ),
  );
}

function queueRequest(key: string, options: LockOptions, reload: boolean) {
  const before = O.getWithDefault(D.get(requests, key), Promise.resolve());
  const next = before.then(() => requestLock(key, options, reload));
  requests = D.set(requests, key, next);
}

async function requestLock(
  key: string,
  options: LockOptions,
  reload: boolean,
): Promise<void> {
  const entry = D.get(entries, key);
  if (O.isNone(entry) || entry.release) return;
  try {
    const held = await navigator.locks.request(key, options, (lock) =>
      lock ? holdLock(key, reload) : false,
    );
    if (!held) freezeUnlessHeld(key);
  } catch {
    // A steal by another window rejects the request of the window that held
    // the lock. So does the abort of this window's own wait, which holds none.
    loseLock(key);
  }
}

/** Resolves when this window lets the lock go, which is what releases it. */
function holdLock(key: string, reload: boolean): Promise<true> {
  return new Promise((resolve) => {
    const entry = D.get(entries, key);
    // The view closed while the request waited.
    if (O.isNone(entry)) {
      resolve(true);
      return;
    }
    patch(key, { release: () => resolve(true), waiting: null });
    void startEditing(key, reload ? entry.hooks.afterTake : undefined);
  });
}

async function startEditing(
  key: string,
  afterTake: EditLockHooks["afterTake"],
): Promise<void> {
  if (afterTake) await afterTake().catch(F.ignore);
  if (O.isSome(D.get(entries, key))) setStatus(key, "editing");
}

function freezeUnlessHeld(key: string): void {
  const entry = D.get(entries, key);
  if (O.isNone(entry) || entry.release) return;
  setStatus(key, "frozen");
}

function loseLock(key: string): void {
  const entry = D.get(entries, key);
  if (O.isNone(entry) || !entry.release) return;
  patch(key, { release: null });
  setStatus(key, "frozen");
}

/**
 * Opens an item for editing in this window: it edits if no other window does,
 * and is frozen otherwise. Call the returned function when the view closes.
 */
export function acquireEditLock(
  kind: EditKind,
  id: string,
  hooks: EditLockHooks,
): () => void {
  const key = editLockKey(kind, id);
  const open = D.get(entries, key);
  entries = D.set(
    entries,
    key,
    O.mapWithDefault<Entry, Entry>(
      open,
      { users: 1, hooks, release: null, waiting: null },
      (entry) => ({ ...entry, users: entry.users + 1, hooks }),
    ),
  );
  if (O.isNone(open)) beginEditing(key);
  return () => leaveEditLock(key);
}

function beginEditing(key: string): void {
  if (!supported()) {
    setStatus(key, "editing");
    return;
  }
  queueRequest(key, { ifAvailable: true }, false);
}

function leaveEditLock(key: string): void {
  const entry = D.get(entries, key);
  if (O.isNone(entry)) return;
  if (entry.users > 1) {
    patch(key, { users: entry.users - 1 });
    return;
  }
  entry.waiting?.abort();
  entry.release?.();
  entries = D.deleteKey(entries, key);
  useEditLockStore.setState((state) => ({
    statuses: D.deleteKey(state.statuses, key),
  }));
}

/**
 * Moves editing to this window. The window that edits is asked to save and
 * let go; if it does not answer in time, this window takes the lock from it.
 */
export function takeOverEditLock(kind: EditKind, id: string): void {
  const key = editLockKey(kind, id);
  const entry = D.get(entries, key);
  if (O.isNone(entry) || entry.release || entry.waiting) return;
  const waiting = new AbortController();
  patch(key, { waiting });
  setStatus(key, "taking");
  postWindowMessage({ type: "handover", kind, id });
  queueRequest(key, { signal: waiting.signal }, true);
  setTimeout(() => stealLock(key, waiting), STEAL_AFTER_MS);
}

function stealLock(key: string, waiting: AbortController): void {
  const entry = D.get(entries, key);
  if (O.isNone(entry) || entry.waiting !== waiting) return;
  waiting.abort();
  patch(key, { waiting: null });
  queueRequest(key, { steal: true }, true);
}

/**
 * Answers another window's `handover`: this window stops editing the item,
 * writes what is pending, and lets the lock go.
 */
export async function handOverEditLock(
  kind: EditKind,
  id: string,
): Promise<void> {
  const key = editLockKey(kind, id);
  const entry = D.get(entries, key);
  if (O.isNone(entry) || !entry.release) return;
  setStatus(key, "frozen");
  if (entry.hooks.beforeRelease) {
    await entry.hooks.beforeRelease().catch(F.ignore);
  }
  const latest = D.get(entries, key);
  if (O.isNone(latest) || !latest.release) return;
  patch(key, { release: null });
  latest.release();
}
