import { D, O, pipe } from "@mobily/ts-belt";
import { useEffect } from "react";
import {
  acquireEditLock,
  type EditLockHooks,
  editLockKey,
  takeOverEditLock,
} from "@/lib/edit-lock";
import { useEditLockStore } from "@/lib/store/edit-lock-store";
import type { EditKind } from "@/lib/window-channel";

/**
 * Opens an item for editing in this window, for as long as the view is
 * mounted. Pass `hooks` with a stable identity. Holding a lock in step with a
 * mounted view is an external-system effect.
 */
export function useEditLock(kind: EditKind, id: string, hooks: EditLockHooks) {
  const status = useEditLockStore((state) =>
    D.get(state.statuses, editLockKey(kind, id)),
  );

  useEffect(() => acquireEditLock(kind, id, hooks), [kind, id, hooks]);

  return {
    /** Another window edits the item: this one shows it, inert. */
    frozen: pipe(
      status,
      O.mapWithDefault(false, (value) => value !== "editing"),
    ),
    /** This window asked to edit and waits for the other one to let go. */
    taking: status === "taking",
    takeOver: () => takeOverEditLock(kind, id),
  };
}
