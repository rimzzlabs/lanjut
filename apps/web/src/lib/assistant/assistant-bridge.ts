import { F, G, R } from "@mobily/ts-belt";
import {
  beginAssistantCall,
  endAssistantCall,
} from "@/lib/store/assistant-activity-store";
import { runAssistantTool } from "./assistant-tools";
import type { AssistantWindow } from "./assistant-window";

/** One tool call from the desktop app. See `src-tauri/src/mcp/bridge.rs`. */
interface AssistantRequest {
  id: number;
  tool: string;
  args: unknown;
  /** What the assistant calls itself, when it says. */
  client: string | null;
}

type AssistantReply =
  | { status: "ok"; value: unknown }
  | { status: "error"; message: string };

// Two assistants can call at once. Each call reads the résumé, waits for the
// editor, and writes, so the calls run one after another, never side by side.
let queue: Promise<unknown> = Promise.resolve();

function queued<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(F.ignore);
  return run;
}

/** The résumé that a call names, for the mark in its editor. */
function resumeIdOf(args: unknown): string | null {
  if (!G.isObject(args) || !("id" in args)) return null;
  return G.isString(args.id) ? args.id : null;
}

async function answer(
  request: AssistantRequest,
  win: AssistantWindow,
): Promise<AssistantReply> {
  const id = resumeIdOf(request.args);
  if (id) beginAssistantCall(id, request.client);
  const result = await queued(() =>
    runAssistantTool({ tool: request.tool, args: request.args }, win),
  ).finally(() => {
    if (id) endAssistantCall(id);
  });
  return R.match(
    result,
    (value): AssistantReply => ({ status: "ok", value }),
    (message): AssistantReply => ({ status: "error", message }),
  );
}

/**
 * Lets the desktop MCP server ask this window for answers. The app accepts
 * only the main window, and only while the server is on. A page load attaches
 * a new channel in place of the old one.
 */
export async function attachAssistantBridge(
  signal: AbortSignal,
  win: AssistantWindow,
) {
  const { Channel, invoke } = await import("@tauri-apps/api/core");
  const channel = new Channel<AssistantRequest>((request) => {
    if (signal.aborted) return;
    void answer(request, win).then((reply) =>
      invoke("mcp_reply", { id: request.id, reply }),
    );
  });
  if (signal.aborted) return;
  await invoke<boolean>("mcp_attach", { channel });
}
