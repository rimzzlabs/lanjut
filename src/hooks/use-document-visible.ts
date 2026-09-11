"use client";

import { useEffect, useState } from "react";

/**
 * Whether the document is actually on screen.
 *
 * The desktop app keeps its window hidden behind the splash until the page has
 * loaded, and a hidden webview does not report a usable viewport. Anything that
 * measures the window at startup, such as choosing between the wide and narrow
 * layouts, reads the wrong value while that is true.
 */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const read = () => setVisible(document.visibilityState === "visible");
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, []);

  return visible;
}
