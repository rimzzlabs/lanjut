import { F } from "@mobily/ts-belt";

/** The two kinds of item that one window edits at a time. */
export type EditKind = "resume" | "profile";

/**
 * What one window tells the others of this browser. `saved` and `deleted`
 * refresh their lists. `handover` asks the window that edits an item to give
 * it up. A message carries a kind and an id, never content.
 */
export interface WindowMessage {
  type: "saved" | "deleted" | "handover";
  kind: EditKind;
  id: string;
}

const CHANNEL_NAME = "lanjut";

let channel: BroadcastChannel | null = null;

// Opened on first use, in the browser only: a BroadcastChannel reaches the
// windows of this origin on this device, and no server.
function openChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  channel ??= new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function postWindowMessage(message: WindowMessage): void {
  openChannel()?.postMessage(message);
}

/** Listens to the other windows. A window never hears its own messages. Returns a cleanup. */
export function onWindowMessage(
  listener: (message: WindowMessage) => void,
): () => void {
  const target = openChannel();
  if (!target) return F.ignore;
  function handle(event: MessageEvent<WindowMessage>) {
    listener(event.data);
  }
  target.addEventListener("message", handle);
  return () => target.removeEventListener("message", handle);
}
