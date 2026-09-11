use tauri::Manager;

/// How long the splash window stays up. The mark finishes drawing and the
/// wordmark settles at about 1.5 seconds, so this leaves a short beat on the
/// finished logo rather than cutting it off mid-animation.
const SPLASH_DURATION_MS: u64 = 1900;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let handle = app.handle().clone();
            // The main window starts hidden, so the user sees the splash instead
            // of an empty frame while the webview boots.
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(SPLASH_DURATION_MS));
                if let Some(splash) = handle.get_webview_window("splashscreen") {
                    let _ = splash.close();
                }
                if let Some(main) = handle.get_webview_window("main") {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running lanjut");
}
