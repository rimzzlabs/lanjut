import type { BUG_AREAS } from "./forms/bug-report";
import { SITE } from "./site";

interface FeedbackWindowOptions {
  kind: "bug" | "feature";
  area: (typeof BUG_AREAS)[number];
  locale: string;
}

const LABEL = "feedback";

/**
 * Opens the hosted feedback form in a second window.
 *
 * The desktop build ships no server, so it cannot host the route that files the
 * issue. Turnstile also accepts fully qualified domain names only, and the app's
 * own origin is not one, so the form has to run on the real site. The window
 * carries the kind, the area the user was in, and which build they are running.
 * No résumé content goes into the URL.
 *
 * The default capability targets the main window, so this window gets no access
 * to the desktop shell.
 */
export async function openFeedbackWindow(options: FeedbackWindowOptions) {
  const [{ getVersion }, os, { WebviewWindow }] = await Promise.all([
    import("@tauri-apps/api/app"),
    import("@tauri-apps/plugin-os"),
    import("@tauri-apps/api/webviewWindow"),
  ]);

  const existing = await WebviewWindow.getByLabel(LABEL);
  if (existing) {
    await existing.setFocus();
    return;
  }

  const url = new URL(`${SITE.url}/${options.locale}/feedback`);
  url.searchParams.set("kind", options.kind);
  url.searchParams.set("area", options.area);
  url.searchParams.set(
    "client",
    `desktop ${await getVersion()} ${os.platform()} ${os.version()}`,
  );

  new WebviewWindow(LABEL, {
    url: url.toString(),
    title: SITE.name,
    width: 720,
    height: 820,
    resizable: true,
  });
}
