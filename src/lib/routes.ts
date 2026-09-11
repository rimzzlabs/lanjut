/**
 * Builds the editor address. Every link and redirect into the editor goes
 * through here so that the id can move between the path and a search param
 * without touching a call site: a static export cannot emit one file per
 * user-generated id, so the desktop build addresses the editor differently.
 */
export function editorHref(id: string): `/platform/editor/${string}` {
  return `/platform/editor/${id}`;
}
