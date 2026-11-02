/**
 * The download label for each system. `data-os-only` shows the visitor's, and
 * the generic label covers phones, tablets, and a page with no script.
 */
export const DOWNLOAD_LABEL_KEYS = [
  { os: "mac", key: "downloadMac" },
  { os: "windows", key: "downloadWindows" },
  { os: "linux", key: "downloadLinux" },
  { os: "web none", key: "downloadApp" },
] as const;
