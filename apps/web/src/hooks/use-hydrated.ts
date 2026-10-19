import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function onClient() {
  return true;
}

function onServer() {
  return false;
}

/**
 * False in static HTML and while an island hydrates, then true. A part that
 * renders only on the client reads it, so that hydration still matches the
 * static HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
