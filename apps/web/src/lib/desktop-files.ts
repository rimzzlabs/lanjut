import DESKTOP_FILES from "./desktop-files.json";
import { REPO_URL } from "./site";

export type DesktopFile = keyof typeof DESKTOP_FILES;

/**
 * The installer of the latest release. The publish job uploads each installer
 * again under the stable name in `desktop-files.json`, so this link never
 * changes and the browser downloads the file without the release page.
 */
export function desktopFileUrl(file: DesktopFile): string {
  return `${REPO_URL}/releases/latest/download/${DESKTOP_FILES[file].file}`;
}
