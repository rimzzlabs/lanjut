import { type Locale, localizePath } from "@lanjut/i18n/routing";
import type {
  FeedbackArea,
  FeedbackDetails,
  FeedbackKind,
} from "./feedback/feedback-schema";
import { SITE } from "./site";

export interface FeedbackWindowOptions {
  kind: FeedbackKind | undefined;
  area: FeedbackArea;
  locale: Locale;
  /** The open résumé's template, font, and language. Never its text. */
  resume: Pick<FeedbackDetails, "template" | "font" | "documentLanguage">;
}

const LABEL = "feedback";

/**
 * Opens the hosted feedback form in a second window.
 *
 * The desktop build ships no server, so it cannot host the route that files the
 * issue. Turnstile also accepts fully qualified domain names only, and the app's
 * own origin is not one, so the form has to run on the real site. The window
 * carries the kind, the area the user was in, the build and system, and the open
 * résumé's look, each as its own parameter. No résumé content goes into the URL.
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

  const url = new URL(localizePath("/feedback", options.locale), SITE.url);
  const params: Record<string, string | undefined> = {
    kind: options.kind,
    area: options.area,
    app: await getVersion(),
    os: `${os.platform()} ${os.version()}`,
    template: options.resume.template,
    font: options.resume.font,
    doclang: options.resume.documentLanguage,
  };
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  new WebviewWindow(LABEL, {
    url: url.toString(),
    title: SITE.name,
    width: 760,
    height: 860,
    resizable: true,
  });
}
