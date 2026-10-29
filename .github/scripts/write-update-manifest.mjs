import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Writes latest.json once, from every signature on the release, after all the
// desktop builds are done. When each build merged its own entry, two builds
// that finished together dropped one entry (0.26.4 lost darwin-aarch64).
//
// The keys match tauri-action: `{os}-{arch}` for the installer the updater
// uses by default, and `{os}-{arch}-{installer}` for each installer.
//
// Usage: node write-update-manifest.mjs <signature dir> <assets.json>
// assets.json is the list of asset names on the release.

const [sigDir, assetsFile] = process.argv.slice(2);
const tag = process.env.TAG;
const repo = process.env.GITHUB_REPOSITORY;

if (!sigDir || !assetsFile || !tag || !repo) {
  console.error(
    "✗ usage: TAG=… GITHUB_REPOSITORY=… node write-update-manifest.mjs <signature dir> <assets.json>",
  );
  process.exit(1);
}

const INSTALLERS = [
  { pattern: /\.app\.tar\.gz\.sig$/, os: "darwin", installer: "app" },
  { pattern: /-setup\.exe\.sig$/, os: "windows", installer: "nsis" },
  { pattern: /\.msi\.sig$/, os: "windows", installer: "msi" },
  { pattern: /\.AppImage\.sig$/, os: "linux", installer: "appimage" },
  { pattern: /\.deb\.sig$/, os: "linux", installer: "deb" },
  { pattern: /\.rpm\.sig$/, os: "linux", installer: "rpm" },
];

// Windows ARM64 has no MSI, so NSIS is the default on both architectures.
const DEFAULT_INSTALLER = { darwin: "app", windows: "nsis", linux: "appimage" };

function archOf(name) {
  if (/aarch64|arm64/.test(name)) return "aarch64";
  if (/x86_64|x64|amd64/.test(name)) return "x86_64";
  return undefined;
}

const assets = new Set(JSON.parse(readFileSync(assetsFile, "utf8")));
const failures = [];
const entries = readdirSync(sigDir)
  .filter((name) => name.endsWith(".sig"))
  .flatMap((name) => {
    const kind = INSTALLERS.find((item) => item.pattern.test(name));
    const arch = archOf(name);
    const bundle = name.slice(0, -".sig".length);
    if (!kind || !arch) {
      failures.push(`can not tell the system or architecture of ${name}`);
      return [];
    }
    if (!assets.has(bundle)) {
      failures.push(`${name} signs ${bundle}, which is not on the release`);
      return [];
    }
    const platform = {
      signature: readFileSync(join(sigDir, name), "utf8"),
      url: `https://github.com/${repo}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(bundle)}`,
    };
    const keys = [`${kind.os}-${arch}-${kind.installer}`];
    if (DEFAULT_INSTALLER[kind.os] === kind.installer)
      keys.push(`${kind.os}-${arch}`);
    return keys.map((key) => [key, platform]);
  });

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}

const manifest = {
  version: tag.replace(/^v/, ""),
  notes: "",
  pub_date: new Date().toISOString(),
  platforms: Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b))),
};

writeFileSync("latest.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `✓ latest.json lists ${Object.keys(manifest.platforms).join(", ")}`,
);
