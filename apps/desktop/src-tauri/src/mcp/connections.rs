//! The open MCP connections. The app counts them for the "connected" mark,
//! and closes every one when the person turns the switch off.

use std::collections::HashMap;
use std::future::Future;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use tauri::async_runtime::JoinHandle;

type OnChange = Box<dyn Fn(usize) + Send + Sync>;

pub struct Connections {
    tasks: Mutex<HashMap<u64, JoinHandle<()>>>,
    next_id: AtomicU64,
    on_change: OnChange,
}

impl Connections {
    /// `on_change` gets the new count after each change.
    pub fn new(on_change: impl Fn(usize) + Send + Sync + 'static) -> Self {
        Self {
            tasks: Mutex::new(HashMap::new()),
            next_id: AtomicU64::new(0),
            on_change: Box::new(on_change),
        }
    }

    pub fn count(&self) -> usize {
        self.tasks.lock().map(|tasks| tasks.len()).unwrap_or(0)
    }

    /// Runs one connection as a task of its own, counted until it ends.
    pub fn spawn<F>(self: &Arc<Self>, connection: F)
    where
        F: Future<Output = ()> + Send + 'static,
    {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        // The task waits for its own entry, so a short connection cannot end
        // before it is counted.
        let (ready, wait) = tokio::sync::oneshot::channel::<()>();
        let this = Arc::clone(self);
        let handle = tauri::async_runtime::spawn(async move {
            let _ = wait.await;
            connection.await;
            this.finish(id);
        });
        let count = match self.tasks.lock() {
            Ok(mut tasks) => {
                tasks.insert(id, handle);
                tasks.len()
            }
            Err(_) => return,
        };
        let _ = ready.send(());
        (self.on_change)(count);
    }

    fn finish(&self, id: u64) {
        let count = match self.tasks.lock() {
            Ok(mut tasks) => {
                if tasks.remove(&id).is_none() {
                    return;
                }
                tasks.len()
            }
            Err(_) => return,
        };
        (self.on_change)(count);
    }

    /// Ends every connection. Each relay then reads the end of its stream.
    pub fn close_all(&self) {
        let closed: Vec<JoinHandle<()>> = match self.tasks.lock() {
            Ok(mut tasks) => tasks.drain().map(|(_, handle)| handle).collect(),
            Err(_) => return,
        };
        if closed.is_empty() {
            return;
        }
        for handle in closed {
            handle.abort();
        }
        (self.on_change)(0);
    }
}
