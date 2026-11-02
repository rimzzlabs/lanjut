import { readFileSync } from "node:fs";

// Prints one "<release name> <stable name>" line per installer. The publish
// job uploads a copy of each installer under its stable name, so the download
// page can link releases/latest/download/<stable name>, which never changes.
// The names live in apps/web/src/lib/desktop-files.json, which the site reads too.
//
// Usage: TAG=v1.2.3 node stable-file-names.mjs <assets.json>
// assets.json is the list of asset names on the release.

const [assetsFile] = process.argv.slice(2);
const tag = process.env.TAG;

if (!assetsFile || !tag) {
  console.error("✗ usage: TAG=… node stable-file-names.mjs <assets.json>");
  process.exit(1);
}

const version = tag.replace(/^v/, "");
const files = JSON.parse(
  readFileSync(
    new URL("../../apps/web/src/lib/desktop-files.json", import.meta.url),
    "utf8",
  ),
);
const assets = new Set(JSON.parse(readFileSync(assetsFile, "utf8")));

const pairs = Object.values(files).map((entry) => ({
  release: entry.release.replace("{version}", version),
  file: entry.file,
}));
const missing = pairs.filter((pair) => !assets.has(pair.release));

if (missing.length > 0) {
  for (const pair of missing) {
    console.error(
      `✗ ${pair.release} is not on the release, so ${pair.file} has no source`,
    );
  }
  process.exit(1);
}

for (const pair of pairs) {
  console.log(`${pair.release} ${pair.file}`);
}
