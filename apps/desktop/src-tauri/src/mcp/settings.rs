//! The switch, kept in a file of the app, because the app must read it before
//! the page loads: the server starts with the app, not with the window.

use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const FILE: &str = "assistant.json";

#[derive(Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct Settings {
    /// Off until the person turns it on.
    #[serde(default)]
    pub enabled: bool,
}

fn file(dir: &Path) -> PathBuf {
    dir.join(FILE)
}

/// A missing or broken file reads as off.
pub fn read(dir: &Path) -> Settings {
    fs::read(file(dir))
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

/// Writes a copy, then renames it, so a crash never leaves half a file.
pub fn write(dir: &Path, settings: &Settings) -> io::Result<()> {
    fs::create_dir_all(dir)?;
    let bytes = serde_json::to_vec(settings).map_err(io::Error::other)?;
    let partial = dir.join(format!("{FILE}.partial"));
    fs::write(&partial, bytes)?;
    fs::rename(partial, file(dir))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scratch(name: &str) -> PathBuf {
        let dir =
            std::env::temp_dir().join(format!("lanjut-settings-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        dir
    }

    #[test]
    fn a_missing_file_reads_as_off() {
        assert_eq!(read(&scratch("missing")), Settings { enabled: false });
    }

    #[test]
    fn a_broken_file_reads_as_off() {
        let dir = scratch("broken");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join(FILE), b"{not json").unwrap();
        assert_eq!(read(&dir), Settings { enabled: false });
    }

    #[test]
    fn writes_and_reads_back() {
        let dir = scratch("round");
        write(&dir, &Settings { enabled: true }).unwrap();
        assert_eq!(read(&dir), Settings { enabled: true });
        assert!(!dir.join(format!("{FILE}.partial")).exists());
    }
}
