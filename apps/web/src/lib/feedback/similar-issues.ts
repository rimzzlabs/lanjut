import { A, G, pipe, S } from "@mobily/ts-belt";

export const SIMILAR_ISSUES_PATH = "/api/feedback/similar";

/** Too short a title matches everything; below this the search waits. */
export const SIMILAR_MIN_LENGTH = 8;

const QUERY_MAX_LENGTH = 100;

export interface SimilarIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  url: string;
}

/**
 * The words of a title, safe to put in a GitHub search: letters, digits, and
 * spaces only, so nothing in it can act as a search qualifier.
 */
export function similarIssuesQuery(title: string): string {
  return pipe(
    title,
    S.replaceByRe(/[^\p{L}\p{N}\s]/gu, " "),
    S.replaceByRe(/\s+/g, " "),
    S.trim,
    S.slice(0, QUERY_MAX_LENGTH),
  );
}

function isSimilarIssue(value: unknown): value is SimilarIssue {
  if (!G.isObject(value)) return false;
  const item = value as Record<string, unknown>;
  return (
    G.isNumber(item.number) &&
    G.isString(item.title) &&
    (item.state === "open" || item.state === "closed") &&
    G.isString(item.url)
  );
}

/** The list the Worker sends, checked before the app shows any of it. */
export function parseSimilarIssues(raw: unknown): ReadonlyArray<SimilarIssue> {
  if (!G.isObject(raw)) return [];
  const list = (raw as { issues?: unknown }).issues;
  if (!Array.isArray(list)) return [];
  return A.filter(list as unknown[], isSimilarIssue);
}

/** GitHub's search result, down to what the form shows. */
export function fromGithubSearch(raw: unknown): ReadonlyArray<SimilarIssue> {
  if (!G.isObject(raw)) return [];
  const items = (raw as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return pipe(
    items as unknown[],
    A.filter(G.isObject),
    A.map((item) => {
      const record = item as Record<string, unknown>;
      return {
        number: record.number,
        title: record.title,
        state: record.state,
        url: record.html_url,
      };
    }),
    A.filter(isSimilarIssue),
  );
}
