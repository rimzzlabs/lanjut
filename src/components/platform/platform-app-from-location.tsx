import { localeFromPath } from "@/i18n/routing";
import { PlatformApp } from "./platform-app";

/**
 * The desktop build's root page. Tauri serves it for any path that has no file
 * of its own, such as /editor/<id> on a reload, so the language and the route
 * come from the address, not from the page that was built.
 */
export function PlatformAppFromLocation() {
  const pathname = window.location.pathname;
  return <PlatformApp locale={localeFromPath(pathname)} pathname={pathname} />;
}
