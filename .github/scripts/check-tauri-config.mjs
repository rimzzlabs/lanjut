import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8"));
const failures = [];

// macOS ships the updater payload as a tarball of the .app bundle. A dmg-only
// target builds no such artifact, so the release carries no latest.json and
// every update check reads a 404. Tauri only warns.
if (
  config.bundle?.createUpdaterArtifacts &&
  !config.bundle?.targets?.includes("app")
) {
  failures.push(
    'bundle.targets must include "app" while createUpdaterArtifacts is true, ' +
      "or the release ships no latest.json and the updater goes quiet.",
  );
}

// Tauri appends a hash source to every CSP directive it manages. A style-src
// that carries a hash makes the browser ignore 'unsafe-inline', and the app
// drops every style attribute in the exported HTML.
const csp = config.app?.security?.csp ?? "";
const styleSrc = csp
  .split(";")
  .find((part) => part.trim().startsWith("style-src"));
const disabled = config.app?.security?.dangerousDisableAssetCspModification;
const styleSrcExempt =
  disabled === true ||
  (Array.isArray(disabled) && disabled.includes("style-src"));
if (styleSrc?.includes("'unsafe-inline'") && !styleSrcExempt) {
  failures.push(
    'security.dangerousDisableAssetCspModification must list "style-src" while ' +
      "the CSP relies on 'unsafe-inline' for styles. The injected hash voids it, " +
      "and the layout then loads without its CSS variables.",
  );
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}
console.log("✓ src-tauri/tauri.conf.json holds its load-bearing values");
