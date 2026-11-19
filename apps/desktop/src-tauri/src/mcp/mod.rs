//! Work with an AI assistant: an MCP server on the device, off by default.
//! The assistant starts the `lanjut-mcp` relay, the relay connects to the local
//! endpoint, and each tool call goes to the page through the bridge.

mod bridge;
mod listener;
mod server;

use bridge::{Bridge, PageReply, PageRequest};
use std::sync::Arc;
use tauri::ipc::Channel;
use tauri::{AppHandle, Manager, Runtime, State, Webview};

/// Until the Preferences switch exists, only this variable turns the server on.
const ENABLE_VAR: &str = "LANJUT_MCP";

pub type SharedBridge = Arc<Bridge>;

pub fn enabled() -> bool {
    std::env::var_os(ENABLE_VAR).is_some_and(|value| value == "1")
}

pub fn start<R: Runtime>(app: &AppHandle<R>) {
    let bridge = app.state::<SharedBridge>().inner().clone();
    let version = app.package_info().version.to_string();
    tauri::async_runtime::spawn(async move {
        if let Err(error) = listener::listen(bridge, version).await {
            eprintln!("lanjut: MCP server did not start: {error}");
        }
    });
    if let Some(relay) = relay_path() {
        eprintln!("lanjut: MCP server on, relay at {}", relay.display());
    }
}

pub fn stop() {
    listener::close();
}

/// Tauri installs a sidecar beside the main executable on every system.
pub fn relay_path() -> Option<std::path::PathBuf> {
    let name = format!("lanjut-mcp{}", std::env::consts::EXE_SUFFIX);
    let exe = std::env::current_exe().ok()?;
    Some(exe.parent()?.join(name))
}

/// Only the main window answers tool calls. Returns false when the server is off.
#[tauri::command]
pub fn mcp_attach(
    webview: Webview,
    bridge: State<'_, SharedBridge>,
    channel: Channel<PageRequest>,
) -> bool {
    if webview.label() != "main" || !enabled() {
        return false;
    }
    bridge.attach(channel);
    true
}

#[tauri::command]
pub fn mcp_reply(
    webview: Webview,
    bridge: State<'_, SharedBridge>,
    id: u64,
    reply: PageReply,
) -> bool {
    webview.label() == "main" && bridge.reply(id, reply)
}
