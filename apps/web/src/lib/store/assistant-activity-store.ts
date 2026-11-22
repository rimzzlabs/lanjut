import { D, O, pipe } from "@mobily/ts-belt";
import { create } from "zustand";

/**
 * An assistant names no document it "has open", so the mark follows what it
 * does: a call on a résumé shows it, and it stays this long after the last one.
 */
const LINGER_MS = 30_000;

/** How long the page marks the parts that one write changed. */
const CHANGE_MS = 3000;

export interface AssistantActivity {
  /** What the assistant calls itself, when it says. */
  client: string | null;
  /** Calls on this résumé that have not answered yet. */
  busy: number;
}

/** The page blocks that the last write changed. */
export interface AssistantChange {
  blockIds: ReadonlyArray<string>;
  /** Tells one write from the next, so a second write on the same blocks shows again. */
  seq: number;
}

interface AssistantActivityState {
  /** By résumé id. */
  activity: Readonly<Record<string, AssistantActivity>>;
  /** By résumé id. */
  changes: Readonly<Record<string, AssistantChange>>;
}

export const useAssistantActivityStore = create<AssistantActivityState>()(
  () => ({ activity: {}, changes: {} }),
);

// The timers that clear a résumé's marks, by id. A timer is a browser object,
// so it lives outside the store.
const activityTimers = new Map<string, ReturnType<typeof setTimeout>>();
const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();
let changeSeq = 0;

function cancelTimer(
  timers: Map<string, ReturnType<typeof setTimeout>>,
  id: string,
) {
  const timer = timers.get(id);
  if (timer === undefined) return;
  clearTimeout(timer);
  timers.delete(id);
}

function update(
  id: string,
  change: (current: O.Option<AssistantActivity>) => AssistantActivity,
) {
  useAssistantActivityStore.setState((state) => ({
    activity: D.set(state.activity, id, change(D.get(state.activity, id))),
  }));
}

/** A call on this résumé starts. */
export function beginAssistantCall(id: string, client: string | null) {
  cancelTimer(activityTimers, id);
  update(id, (current) => ({
    client: client ?? O.mapWithDefault(current, null, (item) => item.client),
    busy: O.mapWithDefault(current, 0, (item) => item.busy) + 1,
  }));
}

/** A call on this résumé answered. The mark stays a while, then goes. */
export function endAssistantCall(id: string) {
  update(id, (current) => ({
    client: O.mapWithDefault(current, null, (item) => item.client),
    busy: Math.max(0, O.mapWithDefault(current, 1, (item) => item.busy) - 1),
  }));
  const done = pipe(
    D.get(useAssistantActivityStore.getState().activity, id),
    O.mapWithDefault(true, (item) => item.busy === 0),
  );
  if (!done) return;
  cancelTimer(activityTimers, id);
  activityTimers.set(
    id,
    setTimeout(() => {
      activityTimers.delete(id);
      useAssistantActivityStore.setState((state) => ({
        activity: D.deleteKey(state.activity, id),
      }));
    }, LINGER_MS),
  );
}

/** A write changed these blocks of the résumé's page. */
export function markAssistantChange(
  id: string,
  blockIds: ReadonlyArray<string>,
) {
  cancelTimer(changeTimers, id);
  changeSeq += 1;
  const change: AssistantChange = { blockIds, seq: changeSeq };
  useAssistantActivityStore.setState((state) => ({
    changes: D.set(state.changes, id, change),
  }));
  changeTimers.set(
    id,
    setTimeout(() => {
      changeTimers.delete(id);
      useAssistantActivityStore.setState((state) => ({
        changes: D.deleteKey(state.changes, id),
      }));
    }, CHANGE_MS),
  );
}

/** Ends every mark at once, when the person turns the assistant off. */
export function clearAssistantActivity() {
  activityTimers.forEach(clearTimeout);
  activityTimers.clear();
  changeTimers.forEach(clearTimeout);
  changeTimers.clear();
  useAssistantActivityStore.setState({ activity: {}, changes: {} });
}
