//! The local endpoint: a Unix socket, or a named pipe on Windows. Each stream
//! that connects gets an MCP connection of its own. No network port opens.

use super::bridge::Bridge;
use super::server::LanjutMcp;
use rmcp::ServiceExt;
use std::io;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::io::{AsyncRead, AsyncWrite};

/// Set once this process binds the endpoint, so that a second copy of the app,
/// which failed to bind, never removes the socket of the first on exit.
static BOUND: AtomicBool = AtomicBool::new(false);

fn serve_connection<S>(stream: S, bridge: Arc<Bridge>, version: String)
where
    S: AsyncRead + AsyncWrite + Send + Unpin + 'static,
{
    tauri::async_runtime::spawn(async move {
        match LanjutMcp::new(bridge, version).serve(stream).await {
            Ok(running) => {
                let _ = running.waiting().await;
            }
            Err(error) => eprintln!("lanjut: MCP connection failed: {error}"),
        }
    });
}

#[cfg(unix)]
pub async fn listen(bridge: Arc<Bridge>, version: String) -> io::Result<()> {
    use std::fs::{self, DirBuilder, Permissions};
    use std::os::unix::fs::{DirBuilderExt, PermissionsExt};
    use tokio::net::{UnixListener, UnixStream};

    let (Some(dir), Some(path)) = (lanjut_mcp::socket_dir(), lanjut_mcp::socket_path()) else {
        return Err(io::Error::new(io::ErrorKind::NotFound, "no data directory"));
    };
    DirBuilder::new().recursive(true).mode(0o700).create(&dir)?;
    fs::set_permissions(&dir, Permissions::from_mode(0o700))?;

    if path.exists() {
        if UnixStream::connect(&path).await.is_ok() {
            return Err(io::Error::new(
                io::ErrorKind::AddrInUse,
                "another Lanjut window already listens",
            ));
        }
        fs::remove_file(&path)?;
    }

    let listener = UnixListener::bind(&path)?;
    BOUND.store(true, Ordering::SeqCst);
    fs::set_permissions(&path, Permissions::from_mode(0o600))?;

    loop {
        match listener.accept().await {
            Ok((stream, _)) => serve_connection(stream, bridge.clone(), version.clone()),
            Err(error) => eprintln!("lanjut: MCP accept failed: {error}"),
        }
    }
}

#[cfg(unix)]
pub fn close() {
    if !BOUND.load(Ordering::SeqCst) {
        return;
    }
    if let Some(path) = lanjut_mcp::socket_path() {
        let _ = std::fs::remove_file(path);
    }
}

#[cfg(windows)]
pub async fn listen(bridge: Arc<Bridge>, version: String) -> io::Result<()> {
    use tokio::net::windows::named_pipe::ServerOptions;

    let name = lanjut_mcp::pipe_name();
    let mut server = ServerOptions::new()
        .first_pipe_instance(true)
        .reject_remote_clients(true)
        .create(&name)?;
    BOUND.store(true, Ordering::SeqCst);

    loop {
        server.connect().await?;
        // The next instance must exist before this one leaves, or a relay that
        // connects in between finds no pipe.
        let next = ServerOptions::new()
            .reject_remote_clients(true)
            .create(&name)?;
        let connected = std::mem::replace(&mut server, next);
        serve_connection(connected, bridge.clone(), version.clone());
    }
}

#[cfg(windows)]
pub fn close() {}
