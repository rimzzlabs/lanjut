import type { DesktopFile } from "@/lib/desktop-files";

export type DownloadOs = "mac" | "windows" | "linux";
export type DownloadFormat = "dmg" | "exe" | "msi" | "appimage" | "deb" | "rpm";
export type DownloadArch = "appleSilicon" | "intel" | "x64" | "arm64";

export interface DownloadChoice {
  file: DesktopFile;
  arch: DownloadArch;
}

export interface DownloadOption {
  format: DownloadFormat;
  choices: ReadonlyArray<DownloadChoice>;
}

export interface DownloadPlatform {
  os: DownloadOs;
  name: string;
  options: ReadonlyArray<DownloadOption>;
}

/** Every installer of a release, grouped by system, then by format. */
export const DOWNLOAD_PLATFORMS: ReadonlyArray<DownloadPlatform> = [
  {
    os: "mac",
    name: "macOS",
    options: [
      {
        format: "dmg",
        choices: [
          { file: "macos-arm64", arch: "appleSilicon" },
          { file: "macos-x64", arch: "intel" },
        ],
      },
    ],
  },
  {
    os: "windows",
    name: "Windows",
    options: [
      {
        format: "exe",
        choices: [
          { file: "windows-x64", arch: "x64" },
          { file: "windows-arm64", arch: "arm64" },
        ],
      },
      { format: "msi", choices: [{ file: "windows-x64-msi", arch: "x64" }] },
    ],
  },
  {
    os: "linux",
    name: "Linux",
    options: [
      {
        format: "appimage",
        choices: [
          { file: "linux-x64-appimage", arch: "x64" },
          { file: "linux-arm64-appimage", arch: "arm64" },
        ],
      },
      {
        format: "deb",
        choices: [
          { file: "linux-x64-deb", arch: "x64" },
          { file: "linux-arm64-deb", arch: "arm64" },
        ],
      },
      {
        format: "rpm",
        choices: [
          { file: "linux-x64-rpm", arch: "x64" },
          { file: "linux-arm64-rpm", arch: "arm64" },
        ],
      },
    ],
  },
];

export interface RecommendedDownload {
  primary: DesktopFile;
  secondary: DesktopFile;
  cta: "macCta" | "windowsCta" | "linuxCta";
  note: "macNote" | "windowsNote" | "linuxNote";
  secondaryLabel: "macIntel" | "windowsArm" | "linuxArm";
}

/** The card a detected system sees first: the file most of its computers need. */
export const RECOMMENDED_DOWNLOADS: Record<DownloadOs, RecommendedDownload> = {
  mac: {
    primary: "macos-arm64",
    secondary: "macos-x64",
    cta: "macCta",
    note: "macNote",
    secondaryLabel: "macIntel",
  },
  windows: {
    primary: "windows-x64",
    secondary: "windows-arm64",
    cta: "windowsCta",
    note: "windowsNote",
    secondaryLabel: "windowsArm",
  },
  linux: {
    primary: "linux-x64-appimage",
    secondary: "linux-arm64-appimage",
    cta: "linuxCta",
    note: "linuxNote",
    secondaryLabel: "linuxArm",
  },
};
