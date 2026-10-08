import { EDITOR_PATHNAME, editorHref, TEMPLATE_PATHNAME } from "./routes";

// The app used to live under /platform: the library at /platform, the editor at
// /platform/editor, and the templates at /platform/template. The editor id rode
// in the query (?id=) and, in the oldest links, in the path.
const LEGACY_PLATFORM_PATH =
  /^(\/id)?\/platform(?:\/(template)|\/editor(?:\/([^/]+))?)?\/?$/;

// /editor?id=<id>: the editor address before the id moved into the path.
const QUERY_EDITOR_PATH = /^(\/id)?\/editor\/?$/;

// /editor/<id>: no file exists per résumé, so the one editor page answers.
const EDITOR_DOCUMENT_PATH = /^(\/id)?\/editor\/[^/]+\/?$/;

function editorTarget(prefix: string, id: string | null, url: URL) {
  const pathname = id === null ? EDITOR_PATHNAME : editorHref(id);
  const target = new URL(`${prefix}${pathname}`, url);
  target.search = url.search;
  target.searchParams.delete("id");
  return target;
}

/**
 * Where an address from an older layout now lives, with the rest of its query
 * kept. Null when the address is current.
 */
export function legacyTarget(url: URL): URL | null {
  const platform = LEGACY_PLATFORM_PATH.exec(url.pathname);
  if (platform) {
    const [, prefix = "", template, pathId] = platform;
    if (template) {
      const target = new URL(`${prefix}${TEMPLATE_PATHNAME}`, url);
      target.search = url.search;
      return target;
    }
    const id =
      pathId === undefined
        ? url.searchParams.get("id")
        : decodeURIComponent(pathId);
    return editorTarget(prefix, id, url);
  }

  const queryEditor = QUERY_EDITOR_PATH.exec(url.pathname);
  const queryId = url.searchParams.get("id");
  if (queryEditor && queryId !== null) {
    return editorTarget(queryEditor[1] ?? "", queryId, url);
  }
  return null;
}

/**
 * The static page that answers a client-routed address: `/editor/<id>` is
 * served by the editor page, which reads the id from the path. Null when the
 * address has its own file.
 */
export function appPageFor(pathname: string): string | null {
  const document = EDITOR_DOCUMENT_PATH.exec(pathname);
  if (!document) return null;
  return `${document[1] ?? ""}${EDITOR_PATHNAME}`;
}
