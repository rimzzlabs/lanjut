//! The `lanjut-mcp` relay that an assistant starts. Each assistant needs its
//! absolute path, so the app finds it at run time.

use serde::Serialize;
use std::path::{Path, PathBuf};

/// Tauri installs a sidecar beside the main executable on every system.
pub fn path() -> Option<PathBuf> {
    let name = format!("lanjut-mcp{}", std::env::consts::EXE_SUFFIX);
    let exe = std::env::current_exe().ok()?;
    Some(exe.parent()?.join(name))
}

/// Why an assistant cannot start the relay.
#[derive(Clone, Copy, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum RelayProblem {
    Missing,
    /// macOS kills a quarantined relay that another app starts, and its
    /// dialog can move all of Lanjut to the Trash.
    Quarantined,
}

pub fn problem(relay: &Path) -> Option<RelayProblem> {
    if !relay.is_file() {
        return Some(RelayProblem::Missing);
    }
    if quarantined(relay) {
        return Some(RelayProblem::Quarantined);
    }
    None
}

#[cfg(target_os = "macos")]
fn quarantined(path: &Path) -> bool {
    use std::ffi::CString;
    use std::os::unix::ffi::OsStrExt;

    let (Ok(path), Ok(name)) = (
        CString::new(path.as_os_str().as_bytes()),
        CString::new("com.apple.quarantine"),
    ) else {
        return false;
    };
    // With no buffer, getxattr gives the size of the attribute, or -1 when the
    // file has none.
    // SAFETY: both strings end in NUL and live until the call returns, and a
    // null buffer of size 0 is the documented way to ask for the size only.
    let size =
        unsafe { libc::getxattr(path.as_ptr(), name.as_ptr(), std::ptr::null_mut(), 0, 0, 0) };
    size >= 0
}

#[cfg(not(target_os = "macos"))]
fn quarantined(_path: &Path) -> bool {
    false
}

/// `Lanjut.app`, from `Lanjut.app/Contents/MacOS/lanjut-mcp`. The quarantine
/// must be cleared from the whole bundle, so the command names the bundle.
pub fn app_bundle(relay: &Path) -> Option<PathBuf> {
    let bundle = relay.parent()?.parent()?.parent()?;
    let is_bundle = bundle
        .extension()
        .is_some_and(|extension| extension == "app");
    is_bundle.then(|| bundle.to_path_buf())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_the_bundle_of_a_mac_app() {
        let relay = Path::new("/Applications/Lanjut.app/Contents/MacOS/lanjut-mcp");
        assert_eq!(
            app_bundle(relay),
            Some(PathBuf::from("/Applications/Lanjut.app"))
        );
        assert_eq!(app_bundle(Path::new("/usr/bin/lanjut-mcp")), None);
    }

    #[test]
    fn a_missing_relay_is_a_problem() {
        let relay = Path::new("/no/such/dir/lanjut-mcp");
        assert_eq!(problem(relay), Some(RelayProblem::Missing));
    }
}
