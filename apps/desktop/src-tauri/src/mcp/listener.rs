//! The local endpoint: a Unix socket, or a named pipe on Windows. Each stream
//! that connects gets an MCP connection of its own. No network port opens.

use super::bridge::Bridge;
use super::connections::Connections;
use super::server::LanjutMcp;
use rmcp::ServiceExt;
use std::io;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::io::{AsyncRead, AsyncWrite};

/// Set while this process holds the endpoint, so that a second copy of the
/// app, which failed to bind, never removes the socket of the first.
static BOUND: AtomicBool = AtomicBool::new(false);

/// What a connection needs from the app.
#[derive(Clone)]
pub struct Context {
    pub bridge: Arc<Bridge>,
    pub version: String,
    pub connections: Arc<Connections>,
}

fn serve_connection<S>(stream: S, context: &Context)
where
    S: AsyncRead + AsyncWrite + Send + Unpin + 'static,
{
    let bridge = context.bridge.clone();
    let version = context.version.clone();
    context.connections.spawn(async move {
        match LanjutMcp::new(bridge, version).serve(stream).await {
            Ok(running) => {
                let _ = running.waiting().await;
            }
            Err(error) => eprintln!("lanjut: MCP connection failed: {error}"),
        }
    });
}

#[cfg(unix)]
pub type Endpoint = tokio::net::UnixListener;

/// Takes the endpoint, or says why not. Call it inside the tokio runtime.
#[cfg(unix)]
pub async fn bind() -> io::Result<Endpoint> {
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
                "another copy of Lanjut already listens",
            ));
        }
        fs::remove_file(&path)?;
    }

    let listener = UnixListener::bind(&path)?;
    BOUND.store(true, Ordering::SeqCst);
    fs::set_permissions(&path, Permissions::from_mode(0o600))?;
    Ok(listener)
}

#[cfg(unix)]
pub async fn accept(endpoint: Endpoint, context: Context) {
    loop {
        match endpoint.accept().await {
            Ok((stream, _)) => serve_connection(stream, &context),
            Err(error) => eprintln!("lanjut: MCP accept failed: {error}"),
        }
    }
}

/// Removes the socket, if this process made it. The listener and the
/// connections stop by their own tasks being aborted.
#[cfg(unix)]
pub fn close() {
    if !BOUND.swap(false, Ordering::SeqCst) {
        return;
    }
    if let Some(path) = lanjut_mcp::socket_path() {
        let _ = std::fs::remove_file(path);
    }
}

#[cfg(windows)]
pub type Endpoint = tokio::net::windows::named_pipe::NamedPipeServer;

#[cfg(windows)]
pub async fn bind() -> io::Result<Endpoint> {
    use tokio::net::windows::named_pipe::ServerOptions;

    let server = ServerOptions::new()
        .first_pipe_instance(true)
        .reject_remote_clients(true)
        .create(lanjut_mcp::pipe_name())?;
    BOUND.store(true, Ordering::SeqCst);
    Ok(server)
}

#[cfg(windows)]
pub async fn accept(mut server: Endpoint, context: Context) {
    use tokio::net::windows::named_pipe::ServerOptions;

    let name = lanjut_mcp::pipe_name();
    loop {
        if let Err(error) = server.connect().await {
            eprintln!("lanjut: MCP accept failed: {error}");
            return;
        }
        // The next instance must exist before this one leaves, or a relay that
        // connects in between finds no pipe.
        let next = match ServerOptions::new()
            .reject_remote_clients(true)
            .create(&name)
        {
            Ok(next) => next,
            Err(error) => {
                eprintln!("lanjut: MCP pipe failed: {error}");
                return;
            }
        };
        let connected = std::mem::replace(&mut server, next);
        serve_connection(connected, &context);
    }
}

#[cfg(windows)]
pub fn close() {
    BOUND.store(false, Ordering::SeqCst);
}
