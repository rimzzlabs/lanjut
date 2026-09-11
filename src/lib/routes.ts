import { IS_DESKTOP } from "@/lib/build-target";

export const EDITOR_PATHNAME = "/platform/editor";

type EditorHref =
  | `${typeof EDITOR_PATHNAME}/${string}`
  | `${typeof EDITOR_PATHNAME}?id=${string}`;

/**
 * Builds the editor address. Every link and redirect into the editor goes
 * through here so that the id can move between the path and a search param
 * without touching a call site: a static export cannot emit one file per
 * user-generated id, so the desktop build addresses the editor differently.
 */
export function editorHref(id: string): EditorHref {
  return IS_DESKTOP
    ? `${EDITOR_PATHNAME}?id=${id}`
    : `${EDITOR_PATHNAME}/${id}`;
}

/**
 * Where the brand mark leads. The web app sends a visitor to the landing page.
 * The desktop app has nobody to sell itself to, so it stays in the workspace.
 */
export function homeHref(): "/" | "/platform" {
  return IS_DESKTOP ? "/platform" : "/";
}
