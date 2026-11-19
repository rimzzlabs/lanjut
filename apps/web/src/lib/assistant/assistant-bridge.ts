import { R } from "@mobily/ts-belt";
import { runAssistantTool } from "./assistant-tools";

/** One tool call from the desktop app. See `src-tauri/src/mcp/bridge.rs`. */
interface AssistantRequest {
  id: number;
  tool: string;
}

type AssistantReply =
  | { status: "ok"; value: unknown }
  | { status: "error"; message: string };

async function answer(request: AssistantRequest): Promise<AssistantReply> {
  return R.match(
    await runAssistantTool(request.tool),
    (value): AssistantReply => ({ status: "ok", value }),
    (message): AssistantReply => ({ status: "error", message }),
  );
}

/**
 * Lets the desktop MCP server ask this window for answers. The app accepts
 * only the main window, and only while the server is on. A page load attaches
 * a new channel in place of the old one.
 */
export async function attachAssistantBridge(signal: AbortSignal) {
  const { Channel, invoke } = await import("@tauri-apps/api/core");
  const channel = new Channel<AssistantRequest>((request) => {
    if (signal.aborted) return;
    void answer(request).then((reply) =>
      invoke("mcp_reply", { id: request.id, reply }),
    );
  });
  if (signal.aborted) return;
  await invoke<boolean>("mcp_attach", { channel });
}
