import { useEffect } from "react";
import { attachAssistantBridge } from "@/lib/assistant/assistant-bridge";
import { IS_DESKTOP } from "@/lib/build-target";

/** Connects the page to the desktop app's MCP server, when it is on. */
export function DesktopAssistantBridge() {
  useEffect(() => {
    if (!IS_DESKTOP) return;
    const controller = new AbortController();
    // A window that cannot attach still works: the server tells the assistant
    // that the window is not ready.
    void attachAssistantBridge(controller.signal).catch(() => undefined);
    return () => controller.abort();
  }, []);

  return null;
}
