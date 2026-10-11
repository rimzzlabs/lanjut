# One editing window

Two windows of one browser share one IndexedDB. Lanjut lets one window edit a résumé or a profile at a time, and checks each write against the copy that the window read. No server is involved.

RFC: [#230](https://github.com/rimzzlabs/lanjut/issues/230).

## Files

| Part                               | Path                                                  |
| ---------------------------------- | ----------------------------------------------------- |
| Lock, handover, steal              | `apps/web/src/lib/edit-lock.ts`                       |
| Messages between windows           | `apps/web/src/lib/window-channel.ts`                  |
| Writes that tell the other windows | `apps/web/src/lib/store/announced-writes.ts`          |
| Lock in a view                     | `useEditLock`, `EditLockFrame`                        |
| Message handler                    | `PlatformWindowSync`                                  |
| What a window does after a message | `resume-store-windows.ts`, `syncProfilesFromDisk`     |
| Revision check                     | `packages/resume/src/db/revision.ts` (`writeRevised`) |
| Dialog after a refused write       | `ConflictDialog`                                      |

The résumé editor and the profile form use the same parts. A view gives a kind (`resume` or `profile`), an id, and two optional hooks.

## Lock

- A view that opens an item requests the Web Lock `lanjut:<kind>:<id>` with `ifAvailable`.
- If the window gets the lock, it edits the item. It keeps the lock until the view closes. The browser releases the lock when the page unloads.
- If the lock is taken, the window is frozen: `EditLockFrame` keeps the content as it was, inert, under a notice with "Edit here". The sidebar and the lists stay usable.
- The notice is a card on a wide screen and a drawer on a phone (below 768 px). The drawer is not modal and has no way to close. The scrim sits above the editor's floating Edit button, so that button never shows through.
- A frozen window does not write the item. The store drops an edit, an undo, and a redo of a frozen résumé, so a keyboard shortcut cannot write either.
- Two views of one item in one window share one lock.
- A browser with no Web Locks edits in every window. The revision check still stops a silent overwrite.

## Handover

1. "Edit here" sends `handover` and waits for the lock.
2. The window that edits freezes, writes what is pending (`beforeRelease`), and releases the lock.
3. If the lock does not come free in 2 seconds, the waiting window takes it with `steal`. The window that lost it freezes.
4. The new editor reads the stored copy again (`afterTake`), then unlocks its forms.

A window lets a lock go in two steps: it resolves its request, and the browser then frees the lock. A new request for the same item in the same window waits for the request before it, so a quick close and reopen does not freeze a window against itself.

## Messages

`window-channel.ts` opens one `BroadcastChannel`. It reaches the windows of the same origin on the same device, and no server. A message holds a type, a kind, and an id, never content.

| Type       | Sent when                           | The other windows                                                           |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------- |
| `saved`    | A résumé or a profile was written   | Read that résumé's library entry again, or reload the profile list          |
| `deleted`  | A résumé or a profile was deleted   | Drop it from the list. A window that has the résumé open asks to restore it |
| `handover` | A frozen window pressed "Edit here" | The window that edits the item gives it up                                  |

A create sends `saved`. The profile list keeps this window's copy of a profile that it edits, so a form does not change under the person.

## Revision check

The lock cannot reach a window on an older build, or a write that lands after a steal. `writeRevised` covers both: it refuses a write when the stored `revision` is not the one the window read or last wrote. The window then shows `ConflictDialog`. See `docs/schema-migrations.md`.

## Test steps

Run `pnpm dev` and open one résumé in two tabs.

1. Check that the second tab is frozen and shows the notice.
2. Edit in the first tab. Check that the second tab does not change and writes nothing.
3. Type in the first tab and press "Edit here" in the second at once. Check that the first tab freezes and that the second shows the typed text.
4. Close the tab that edits. Check that "Edit here" in the other tab works at once.
5. Delete the résumé from the library in a third tab. Check the dialog in the editor tab, and check that each library drops the résumé.
6. Open one profile in two tabs, and repeat steps 1 to 3 with the profile form.
