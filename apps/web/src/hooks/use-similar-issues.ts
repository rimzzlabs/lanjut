import { useEffect, useState } from "react";
import {
  parseSimilarIssues,
  SIMILAR_ISSUES_PATH,
  SIMILAR_MIN_LENGTH,
  type SimilarIssue,
  similarIssuesQuery,
} from "@/lib/feedback/similar-issues";

const DEBOUNCE_MS = 500;

interface SimilarState {
  query: string;
  issues: ReadonlyArray<SimilarIssue>;
}

/**
 * Issues with titles like the one being typed, once it is long enough and
 * the typing pauses. A newer title cancels the older search. A failed search
 * shows nothing: finding duplicates helps, but it never blocks a report.
 * Searching GitHub through the Worker is an external-system effect.
 */
export function useSimilarIssues(title: string): ReadonlyArray<SimilarIssue> {
  const query = similarIssuesQuery(title);
  const [state, setState] = useState<SimilarState>({ query: "", issues: [] });

  useEffect(() => {
    if (query.length < SIMILAR_MIN_LENGTH) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`${SIMILAR_ISSUES_PATH}?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => setState({ query, issues: parseSimilarIssues(data) }))
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (query.length < SIMILAR_MIN_LENGTH) return [];
  return state.issues;
}
