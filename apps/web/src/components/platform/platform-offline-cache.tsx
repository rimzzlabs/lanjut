import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/service-worker";

/** Starts the offline cache. Registering a service worker is an external-system effect. */
export function PlatformOfflineCache() {
  useEffect(() => registerServiceWorker(), []);

  return null;
}
