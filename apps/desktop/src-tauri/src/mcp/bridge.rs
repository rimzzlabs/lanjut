//! A request and its reply, from Rust to the page. Tauri sends Rust to the page
//! only one way, so each request carries an id, the page answers through the
//! `mcp_reply` command, and a timeout ends a request that gets no answer.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fmt;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::ipc::Channel;
use tokio::sync::oneshot;

const REPLY_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Clone, Serialize)]
pub struct PageRequest {
    id: u64,
    tool: &'static str,
}

#[derive(Deserialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum PageReply {
    Ok { value: Value },
    Error { message: String },
}

pub enum BridgeError {
    NoWindow,
    Timeout,
    Page(String),
}

impl fmt::Display for BridgeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NoWindow => f.write_str("The Lanjut window is not ready. Open it, then try again."),
            Self::Timeout => write!(
                f,
                "Lanjut did not answer in {} seconds. Bring the Lanjut window to the front, then try again.",
                REPLY_TIMEOUT.as_secs()
            ),
            Self::Page(message) => f.write_str(message),
        }
    }
}

#[derive(Default)]
pub struct Bridge {
    channel: Mutex<Option<Channel<PageRequest>>>,
    pending: Mutex<HashMap<u64, oneshot::Sender<PageReply>>>,
    next_id: AtomicU64,
}

impl Bridge {
    /// A page load replaces the channel of the page before it.
    pub fn attach(&self, channel: Channel<PageRequest>) {
        if let Ok(mut slot) = self.channel.lock() {
            *slot = Some(channel);
        }
    }

    /// False when no request waits under this id, because it timed out.
    pub fn reply(&self, id: u64, reply: PageReply) -> bool {
        let waiting = self.pending.lock().ok().and_then(|mut map| map.remove(&id));
        waiting.is_some_and(|sender| sender.send(reply).is_ok())
    }

    pub async fn call(&self, tool: &'static str) -> Result<Value, BridgeError> {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        let (sender, receiver) = oneshot::channel();
        if let Ok(mut map) = self.pending.lock() {
            map.insert(id, sender);
        }

        if !self.send(PageRequest { id, tool }) {
            self.forget(id);
            return Err(BridgeError::NoWindow);
        }

        match tokio::time::timeout(REPLY_TIMEOUT, receiver).await {
            Ok(Ok(PageReply::Ok { value })) => Ok(value),
            Ok(Ok(PageReply::Error { message })) => Err(BridgeError::Page(message)),
            Ok(Err(_)) => Err(BridgeError::NoWindow),
            Err(_) => {
                self.forget(id);
                Err(BridgeError::Timeout)
            }
        }
    }

    fn send(&self, request: PageRequest) -> bool {
        let Ok(slot) = self.channel.lock() else {
            return false;
        };
        slot.as_ref()
            .is_some_and(|channel| channel.send(request).is_ok())
    }

    fn forget(&self, id: u64) {
        if let Ok(mut map) = self.pending.lock() {
            map.remove(&id);
        }
    }
}
