import { create } from "zustand";

/**
 * Where this window stands on an item it has open. `editing`: it holds the
 * lock. `frozen`: another window does. `taking`: it asked for the lock and
 * waits for it.
 */
export type EditLockStatus = "editing" | "frozen" | "taking";

interface EditLockState {
  /** By lock key (`editLockKey`). An item with no entry is not open here. */
  statuses: Readonly<Record<string, EditLockStatus>>;
}

export const useEditLockStore = create<EditLockState>()(() => ({
  statuses: {},
}));
