import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function isOnline() {
  return navigator.onLine;
}

function onlineOnServer() {
  return true;
}

/** Whether the browser reports a network connection. */
export function useOnline() {
  return useSyncExternalStore(subscribe, isOnline, onlineOnServer);
}
