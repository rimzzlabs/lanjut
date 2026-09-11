import { IS_DESKTOP } from "./build-target";

/**
 * Opens a URL outside the app. The system webview ignores `window.open` and
 * `target="_blank"`, so the desktop build hands the URL to the operating system
 * and lets the user's own browser take it. The plugin is imported lazily to keep
 * it out of the web bundle's critical path.
 */
export async function openExternal(url: string) {
  if (!IS_DESKTOP) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}
