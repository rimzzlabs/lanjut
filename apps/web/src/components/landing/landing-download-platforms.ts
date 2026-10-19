import {
  AppleLogoIcon,
  type Icon,
  LinuxLogoIcon,
  WindowsLogoIcon,
} from "@phosphor-icons/react";

export interface DesktopPlatform {
  /** Prefix of the `Meta`, `Cta`, and `Note` keys in the `landing` messages. */
  key: "mac" | "windows" | "linux";
  name: string;
  icon: Icon;
  /** The heading of this system in `docs/install.md`. */
  anchor: "macos" | "windows" | "linux";
}

export const DESKTOP_PLATFORMS: ReadonlyArray<DesktopPlatform> = [
  { key: "mac", name: "macOS", icon: AppleLogoIcon, anchor: "macos" },
  { key: "windows", name: "Windows", icon: WindowsLogoIcon, anchor: "windows" },
  { key: "linux", name: "Linux", icon: LinuxLogoIcon, anchor: "linux" },
];
