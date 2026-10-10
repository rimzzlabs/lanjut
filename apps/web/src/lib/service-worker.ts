import { F } from "@mobily/ts-belt";
import { IS_DESKTOP } from "./build-target";

/** Written by the web build (`service-worker/build.ts`). */
const SERVICE_WORKER_URL = "/sw.js";

interface DataSaverNavigator {
  connection?: { saveData?: boolean };
}

function savesData(): boolean {
  return (navigator as DataSaverNavigator).connection?.saveData === true;
}

function register(): void {
  // Offline use is an extra: the site works online without it.
  navigator.serviceWorker.register(SERVICE_WORKER_URL).catch(F.ignore);
}

/**
 * Registers the service worker that keeps the app files for offline use, after
 * the page has loaded, so its download never competes with the first paint.
 * Production web builds only. Returns a cleanup.
 */
export function registerServiceWorker(): () => void {
  if (IS_DESKTOP || import.meta.env.DEV) return F.ignore;
  if (!("serviceWorker" in navigator) || savesData()) return F.ignore;
  if (document.readyState === "complete") {
    register();
    return F.ignore;
  }
  window.addEventListener("load", register, { once: true });
  return () => window.removeEventListener("load", register);
}
