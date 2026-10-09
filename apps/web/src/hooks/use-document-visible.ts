import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function isVisible() {
  return document.visibilityState === "visible";
}

function visibleOnServer() {
  return true;
}

/**
 * Whether the document is actually on screen.
 *
 * The desktop app keeps its window hidden behind the splash until the page has
 * loaded, and a hidden webview does not report a usable viewport. Anything that
 * measures the window at startup, such as choosing between the wide and narrow
 * layouts, reads the wrong value while that is true.
 */
export function useDocumentVisible() {
  return useSyncExternalStore(subscribe, isVisible, visibleOnServer);
}
