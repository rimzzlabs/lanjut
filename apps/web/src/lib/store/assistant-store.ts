import { create } from "zustand";
import { clearAssistantActivity } from "./assistant-activity-store";

/** Why an assistant cannot start the relay. See `src-tauri/src/mcp/relay.rs`. */
export type RelayProblem = "missing" | "quarantined";

/** Why the server is on but does not serve. */
export type AssistantStartError = "inUse" | "failed";

/** The desktop app's MCP server, as `assistant_status` gives it. */
export interface AssistantStatus {
  enabled: boolean;
  serving: boolean;
  connections: number;
  relayPath: string | null;
  appBundlePath: string | null;
  relayProblem: RelayProblem | null;
  startError: AssistantStartError | null;
}

interface AssistantStoreState {
  /** Null until the desktop app answers, and always on the web. */
  status: AssistantStatus | null;
  /** A change of the switch waits for the app. */
  changing: boolean;
  setStatus: (status: AssistantStatus) => void;
  setEnabled: (enabled: boolean) => Promise<boolean>;
}

/**
 * Work with an AI assistant. The desktop app keeps the switch, not this
 * store, because the server starts with the app, before any page loads.
 */
export const useAssistantStore = create<AssistantStoreState>()((set) => ({
  status: null,
  changing: false,
  setStatus(status) {
    if (!status.enabled) clearAssistantActivity();
    set({ status });
  },
  async setEnabled(enabled) {
    set({ changing: true });
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const status = await invoke<AssistantStatus>("assistant_set_enabled", {
        enabled,
      });
      if (!status.enabled) clearAssistantActivity();
      set({ status, changing: false });
      return true;
    } catch {
      set({ changing: false });
      return false;
    }
  },
}));

/** Whether an assistant is connected now. */
export function selectConnected(state: AssistantStoreState): boolean {
  return state.status?.enabled === true && state.status.connections > 0;
}

/**
 * Reads the status from the desktop app and follows its changes until the
 * signal aborts. A subscription to the app is an external system.
 */
export async function watchAssistantStatus(signal: AbortSignal): Promise<void> {
  const [{ invoke }, { listen }] = await Promise.all([
    import("@tauri-apps/api/core"),
    import("@tauri-apps/api/event"),
  ]);
  const { setStatus } = useAssistantStore.getState();
  const unlisten = await listen<AssistantStatus>("assistant-status", (event) =>
    setStatus(event.payload),
  );
  if (signal.aborted) {
    unlisten();
    return;
  }
  signal.addEventListener("abort", unlisten, { once: true });
  setStatus(await invoke<AssistantStatus>("assistant_status"));
}
