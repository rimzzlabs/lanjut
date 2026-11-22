import { A, pipe, S } from "@mobily/ts-belt";

/** The name each assistant saves the server under. */
const SERVER_NAME = "lanjut";

export type AssistantClient =
  | "claudeCode"
  | "codex"
  | "cursor"
  | "lmStudio"
  | "claudeDesktop"
  | "other";

/** How the person connects one assistant: a command or text to copy, or a link to open. */
export type ConnectAction =
  | { kind: "copy"; text: string }
  | { kind: "open"; url: string };

export const ASSISTANT_CLIENTS: ReadonlyArray<AssistantClient> = [
  "claudeCode",
  "codex",
  "cursor",
  "lmStudio",
  "claudeDesktop",
  "other",
];

const PLAIN_POSIX = /^[\w@%+=:,./-]+$/;

/**
 * The path as one word in a shell. A Windows path goes in double quotes,
 * which PowerShell and cmd both read. A POSIX path goes in single quotes, with
 * each single quote written as '\''.
 */
export function shellWord(path: string): string {
  if (S.includes(path, "\\")) return `"${path}"`;
  if (PLAIN_POSIX.test(path)) return path;
  return `'${S.replaceAll(path, "'", "'\\''")}'`;
}

function serverConfig(relayPath: string) {
  return { command: relayPath, args: [] };
}

/** JSON as base64 of its UTF-8 bytes. `btoa` alone refuses a non-Latin path. */
function base64Json(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(
    pipe(
      Array.from(bytes),
      A.map((byte) => String.fromCharCode(byte)),
      A.join(""),
    ),
  );
}

function installLink(base: string, relayPath: string): string {
  const config = encodeURIComponent(base64Json(serverConfig(relayPath)));
  return `${base}?name=${SERVER_NAME}&config=${config}`;
}

/** The `mcpServers` entry that Claude Desktop and most other assistants read. */
export function serversJson(relayPath: string): string {
  return JSON.stringify(
    { mcpServers: { [SERVER_NAME]: serverConfig(relayPath) } },
    null,
    2,
  );
}

const ACTIONS: Record<AssistantClient, (relayPath: string) => ConnectAction> = {
  claudeCode: (relayPath) => ({
    kind: "copy",
    text: `claude mcp add --transport stdio ${SERVER_NAME} -- ${shellWord(relayPath)}`,
  }),
  codex: (relayPath) => ({
    kind: "copy",
    text: `codex mcp add ${SERVER_NAME} -- ${shellWord(relayPath)}`,
  }),
  cursor: (relayPath) => ({
    kind: "open",
    url: installLink(
      "cursor://anysphere.cursor-deeplink/mcp/install",
      relayPath,
    ),
  }),
  lmStudio: (relayPath) => ({
    kind: "open",
    url: installLink("lmstudio://add_mcp", relayPath),
  }),
  claudeDesktop: (relayPath) => ({
    kind: "copy",
    text: serversJson(relayPath),
  }),
  other: (relayPath) => ({ kind: "copy", text: serversJson(relayPath) }),
};

export function connectAction(
  client: AssistantClient,
  relayPath: string,
): ConnectAction {
  return ACTIONS[client](relayPath);
}

/** Clears the quarantine from the whole app, so macOS lets an assistant start the relay. */
export function unquarantineCommand(appBundlePath: string): string {
  return `xattr -dr com.apple.quarantine ${shellWord(appBundlePath)}`;
}
