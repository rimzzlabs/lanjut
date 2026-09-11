use std::sync::mpsc::{channel, Sender};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::webview::PageLoadEvent;
use tauri::window::Color;
use tauri::{Manager, Theme};

/// Window backgrounds, matched to the app's own paper tokens. Without these the
/// webview paints its default white, which flashes on a dark system.
const PAPER_LIGHT: Color = Color(253, 252, 247, 255);
const PAPER_DARK: Color = Color(18, 26, 23, 255);

fn paper_for(theme: Option<Theme>) -> Color {
    match theme {
        Some(Theme::Dark) => PAPER_DARK,
        _ => PAPER_LIGHT,
    }
}

/// The splash never closes sooner than this, so its animation is not cut off.
const SPLASH_MIN_MS: u64 = 1900;
/// Nor later than this. A page that never finishes loading must not trap the
/// user in a splash window with no way forward.
const SPLASH_MAX_MS: u64 = 15_000;

/// Carries the single "main window finished loading" signal out of the page-load
/// hook. Taken once, so a later in-app navigation cannot fire it again.
struct PageLoaded(Mutex<Option<Sender<()>>>);

pub fn run() {
    let (tx, rx) = channel::<()>();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .manage(PageLoaded(Mutex::new(Some(tx))))
        .on_page_load(|webview, payload| {
            if webview.label() != "main" || payload.event() != PageLoadEvent::Finished {
                return;
            }
            let state = webview.state::<PageLoaded>();
            let sender = state.0.lock().ok().and_then(|mut slot| slot.take());
            if let Some(sender) = sender {
                let _ = sender.send(());
            }
        })
        .setup(move |app| {
            let handle = app.handle().clone();

            // Follow the system theme before anything paints.
            for label in ["splashscreen", "main"] {
                if let Some(window) = app.get_webview_window(label) {
                    let paper = paper_for(window.theme().ok());
                    let _ = window.set_background_color(Some(paper));
                }
            }
            // The splash covers the main window rather than replacing it. A
            // hidden window is not laid out, so anything that measured the
            // viewport during startup read the wrong size and the layout came
            // up wrong. The main window is now real from the first frame and
            // simply sits behind the splash.
            std::thread::spawn(move || {
                let started = Instant::now();
                let _ = rx.recv_timeout(Duration::from_millis(SPLASH_MAX_MS));

                let minimum = Duration::from_millis(SPLASH_MIN_MS);
                let elapsed = started.elapsed();
                if elapsed < minimum {
                    std::thread::sleep(minimum - elapsed);
                }

                if let Some(splash) = handle.get_webview_window("splashscreen") {
                    let _ = splash.close();
                }
                if let Some(main) = handle.get_webview_window("main") {
                    let _ = main.set_focus();
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running lanjut");
}
