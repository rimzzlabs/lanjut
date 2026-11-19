//! `lanjut-mcp`: an AI assistant starts this binary and talks MCP to it over
//! stdio. It copies the bytes to the Lanjut app's local socket and back. It
//! holds no MCP logic.

use std::io;
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};

const NOT_LISTENING: &str =
    "Lanjut is not listening. Open Lanjut and turn on Work with an AI assistant, then try again.";

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let code = match relay().await {
        Ok(()) => 0,
        Err(error) => {
            eprintln!("lanjut-mcp: {error}");
            1
        }
    };
    // The stdin reader blocks a thread that a runtime shutdown would wait for.
    std::process::exit(code)
}

async fn relay() -> io::Result<()> {
    let stream = connect().await.map_err(|error| match error.kind() {
        io::ErrorKind::NotFound | io::ErrorKind::ConnectionRefused => {
            io::Error::new(error.kind(), NOT_LISTENING)
        }
        _ => error,
    })?;
    let (from_app, mut to_app) = tokio::io::split(stream);

    let upstream = async {
        let copied = pump(tokio::io::stdin(), &mut to_app).await;
        // The assistant closed stdin: let the app finish its replies, then close.
        let _ = to_app.shutdown().await;
        copied
    };
    let downstream = pump(from_app, tokio::io::stdout());
    tokio::pin!(downstream);

    tokio::select! {
        done = &mut downstream => done,
        sent = upstream => {
            sent?;
            downstream.await
        }
    }
}

/// Copies until end of file, with a flush after each read so that a JSON-RPC
/// line never waits in a buffer.
async fn pump<R, W>(mut from: R, mut to: W) -> io::Result<()>
where
    R: AsyncRead + Unpin,
    W: AsyncWrite + Unpin,
{
    let mut buffer = vec![0u8; 64 * 1024];
    loop {
        let read = from.read(&mut buffer).await?;
        if read == 0 {
            return Ok(());
        }
        to.write_all(&buffer[..read]).await?;
        to.flush().await?;
    }
}

#[cfg(unix)]
async fn connect() -> io::Result<tokio::net::UnixStream> {
    let path = lanjut_mcp::socket_path()
        .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "no data directory"))?;
    tokio::net::UnixStream::connect(path).await
}

#[cfg(windows)]
async fn connect() -> io::Result<tokio::net::windows::named_pipe::NamedPipeClient> {
    use std::time::Duration;
    use tokio::net::windows::named_pipe::ClientOptions;

    const ERROR_PIPE_BUSY: i32 = 231;
    let name = lanjut_mcp::pipe_name();
    // Every instance can be taken for a moment while the app creates the next one.
    for _ in 0..20 {
        match ClientOptions::new().open(&name) {
            Err(error) if error.raw_os_error() == Some(ERROR_PIPE_BUSY) => {
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
            other => return other,
        }
    }
    Err(io::Error::new(
        io::ErrorKind::TimedOut,
        "the Lanjut pipe stayed busy",
    ))
}
