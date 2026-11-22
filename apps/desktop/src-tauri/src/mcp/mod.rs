//! Work with an AI assistant: an MCP server on the device, off by default.
//! The assistant starts the `lanjut-mcp` relay, the relay connects to the local
//! endpoint, and each tool call goes to the page through the bridge. The
//! person turns it on and off in the app, and the app keeps that choice.

mod args;
mod bridge;
mod connections;
mod listener;
mod relay;
mod server;
mod settings;

use bridge::{Bridge, PageReply, PageRequest};
use connections::Connections;
use relay::RelayProblem;
use serde::Serialize;
use settings::Settings;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::async_runtime::JoinHandle;
use tauri::ipc::Channel;
use tauri::{AppHandle, Emitter, Manager, State, Webview};
use tokio::sync::Mutex;

/// The page listens for this event to follow the switch and the connections.
const STATUS_EVENT: &str = "assistant-status";

/// Why the server is on but does not serve.
#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum StartError {
    /// Another copy of Lanjut serves the endpoint.
    InUse,
    Failed,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantStatus {
    enabled: bool,
    serving: bool,
    connections: usize,
    relay_path: Option<String>,
    /// The `.app` bundle on macOS, for the command that clears the quarantine.
    app_bundle_path: Option<String>,
    relay_problem: Option<RelayProblem>,
    start_error: Option<StartError>,
}

#[derive(Default)]
struct Server {
    enabled: bool,
    listener: Option<JoinHandle<()>>,
    start_error: Option<StartError>,
}

pub struct Assistant {
    app: AppHandle,
    config_dir: Option<PathBuf>,
    bridge: Arc<Bridge>,
    connections: Arc<Connections>,
    server: Mutex<Server>,
}

fn path_text(path: Option<PathBuf>) -> Option<String> {
    path.map(|path| path.to_string_lossy().into_owned())
}

impl Assistant {
    fn new(app: AppHandle) -> Self {
        let config_dir = app.path().app_config_dir().ok();
        let events = app.clone();
        let connections = Arc::new(Connections::new(move |_| {
            let events = events.clone();
            tauri::async_runtime::spawn(async move {
                let assistant = events.state::<Assistant>();
                assistant.announce().await;
            });
        }));
        Self {
            app,
            config_dir,
            bridge: Arc::new(Bridge::default()),
            connections,
            server: Mutex::new(Server::default()),
        }
    }

    async fn status(&self) -> AssistantStatus {
        let server = self.server.lock().await;
        let relay = relay::path();
        AssistantStatus {
            enabled: server.enabled,
            serving: server.listener.is_some(),
            connections: self.connections.count(),
            relay_problem: relay.as_deref().and_then(relay::problem),
            app_bundle_path: path_text(relay.as_deref().and_then(relay::app_bundle)),
            relay_path: path_text(relay),
            start_error: server.start_error,
        }
    }

    async fn announce(&self) {
        let status = self.status().await;
        let _ = self.app.emit_to("main", STATUS_EVENT, status);
    }

    async fn start(&self) {
        let mut server = self.server.lock().await;
        server.enabled = true;
        if server.listener.is_some() {
            return;
        }
        match listener::bind().await {
            Ok(endpoint) => {
                let context = listener::Context {
                    bridge: self.bridge.clone(),
                    version: self.app.package_info().version.to_string(),
                    connections: self.connections.clone(),
                };
                server.listener = Some(tauri::async_runtime::spawn(listener::accept(
                    endpoint, context,
                )));
                server.start_error = None;
            }
            Err(error) => {
                eprintln!("lanjut: MCP server did not start: {error}");
                server.start_error = Some(match error.kind() {
                    std::io::ErrorKind::AddrInUse => StartError::InUse,
                    _ => StartError::Failed,
                });
            }
        }
    }

    async fn stop(&self) {
        let mut server = self.server.lock().await;
        server.enabled = false;
        server.start_error = None;
        if let Some(listener) = server.listener.take() {
            listener.abort();
        }
        self.connections.close_all();
        listener::close();
    }

    async fn set_enabled(&self, enabled: bool) -> Result<(), String> {
        let Some(dir) = &self.config_dir else {
            return Err("Lanjut has no folder for its settings.".into());
        };
        settings::write(dir, &Settings { enabled }).map_err(|error| error.to_string())?;
        if enabled {
            self.start().await;
        } else {
            self.stop().await;
        }
        Ok(())
    }
}

/// Reads the switch and starts the server when it is on. Call it in `setup`.
pub fn setup(app: &AppHandle) {
    let assistant = Assistant::new(app.clone());
    let enabled = assistant
        .config_dir
        .as_deref()
        .is_some_and(|dir| settings::read(dir).enabled);
    app.manage(assistant);
    if enabled {
        let app = app.clone();
        tauri::async_runtime::spawn(async move {
            let assistant = app.state::<Assistant>();
            assistant.start().await;
            assistant.announce().await;
        });
    }
}

/// Removes the socket on a normal quit.
pub fn stop() {
    listener::close();
}

/// Only the main window answers tool calls.
#[tauri::command]
pub fn mcp_attach(
    webview: Webview,
    assistant: State<'_, Assistant>,
    channel: Channel<PageRequest>,
) -> bool {
    if webview.label() != "main" {
        return false;
    }
    assistant.bridge.attach(channel);
    true
}

#[tauri::command]
pub fn mcp_reply(
    webview: Webview,
    assistant: State<'_, Assistant>,
    id: u64,
    reply: PageReply,
) -> bool {
    webview.label() == "main" && assistant.bridge.reply(id, reply)
}

#[tauri::command]
pub async fn assistant_status(assistant: State<'_, Assistant>) -> Result<AssistantStatus, ()> {
    Ok(assistant.status().await)
}

/// Turns the server on or off, keeps the choice, and gives the new status.
#[tauri::command]
pub async fn assistant_set_enabled(
    webview: Webview,
    assistant: State<'_, Assistant>,
    enabled: bool,
) -> Result<AssistantStatus, String> {
    if webview.label() != "main" {
        return Err("Only the main window changes this.".into());
    }
    assistant.set_enabled(enabled).await?;
    assistant.announce().await;
    Ok(assistant.status().await)
}
