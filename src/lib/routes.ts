import { IS_DESKTOP } from "@/lib/build-target";

export const EDITOR_PATHNAME = "/platform/editor";

type EditorHref = `${typeof EDITOR_PATHNAME}?id=${string}`;

/**
 * Builds the editor address. Every link and redirect into the editor goes
 * through here. The site is static, so the id rides in a search param: there
 * is no page per user-generated id.
 */
export function editorHref(id: string): EditorHref {
  return `${EDITOR_PATHNAME}?id=${id}`;
}

/**
 * Where the brand mark leads. The web app sends a visitor to the landing page.
 * The desktop app has nobody to sell itself to, so it stays in the workspace.
 */
export function homeHref(): "/" | "/platform" {
  return IS_DESKTOP ? "/platform" : "/";
}
