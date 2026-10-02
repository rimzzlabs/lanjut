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

/** False during the server render and hydration, true once the client renders. */
export function useIsClient() {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
