import { IS_DESKTOP } from "./build-target";

/**
 * The workspace. `/editor` is the résumé library and `/editor/<id>` opens that
 * résumé in the editor. Both are served by the one editor page; the client
 * router reads the id from the path.
 */
export const EDITOR_PATHNAME = "/editor";

/** The client route for one résumé in the editor. */
export const EDITOR_DOCUMENT_ROUTE = `${EDITOR_PATHNAME}/:id`;

export const TEMPLATE_PATHNAME = "/template";

/** The profiles: the personal information and summary that fill new résumés. */
export const PROFILE_PATHNAME = "/profile";

/** The release history. It renders inside the app shell and is indexed. */
export const CHANGELOG_PATHNAME = "/changelog";

type EditorHref = `${typeof EDITOR_PATHNAME}/${string}`;

/** Builds the editor address. Every link and redirect into the editor goes through here. */
export function editorHref(id: string): EditorHref {
  return `${EDITOR_PATHNAME}/${encodeURIComponent(id)}`;
}

/**
 * Where the brand mark leads. The web app sends a visitor to the landing page.
 * The desktop app has nobody to sell itself to, so it stays in the workspace.
 */
export function homeHref(): "/" | typeof EDITOR_PATHNAME {
  return IS_DESKTOP ? EDITOR_PATHNAME : "/";
}
