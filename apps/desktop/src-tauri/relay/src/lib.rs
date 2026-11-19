//! Where the Lanjut desktop app listens for MCP connections. The app and the
//! relay both read the address from here, so the two cannot drift apart.

/// The app's `identifier` in `tauri.conf.json`. Tauri keys the data directory by it.
pub const IDENTIFIER: &str = "com.rimzzlabs.lanjut";

#[cfg(unix)]
mod unix {
    use std::path::PathBuf;

    /// A directory of its own, so mode 0700 on it closes the gap between
    /// `bind` and the `chmod` of the socket.
    pub fn socket_dir() -> Option<PathBuf> {
        dirs::data_dir().map(|data| data.join(super::IDENTIFIER).join("mcp"))
    }

    pub fn socket_path() -> Option<PathBuf> {
        socket_dir().map(|dir| dir.join("lanjut.sock"))
    }
}

#[cfg(unix)]
pub use unix::{socket_dir, socket_path};

/// One pipe name for each account. Named pipes share one namespace on the machine.
#[cfg(windows)]
pub fn pipe_name() -> String {
    let user = std::env::var("USERNAME").unwrap_or_default();
    format!(r"\\.\pipe\{IDENTIFIER}.mcp.{user}")
}
