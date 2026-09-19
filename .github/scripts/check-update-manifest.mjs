import { readFileSync } from "node:fs";

// The 0.17.0 release published with no update manifest at all. Both of the
// tauri-action lines that explain why are warnings, so the job stayed green and
// the fault only surfaced on an installed app, which fails an update check in
// silence. This reads the manifest back off the release and fails loudly.
//
// Each architecture's job merges its own entry into the manifest on the
// release, so two jobs that finish together can drop each other's entry. Run
// this once both are done, against every architecture the release must serve.

const platforms = (process.env.PLATFORMS ?? "").split(/\s+/).filter(Boolean);
const tag = process.env.TAG;
const failures = [];

if (platforms.length === 0) {
  console.error("✗ PLATFORMS is not set");
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync("latest.json", "utf8"));
} catch (error) {
  console.error(
    `✗ can not read latest.json from the release: ${error.message}`,
  );
  process.exit(1);
}

for (const platform of platforms) {
  const entry = manifest.platforms?.[platform];
  if (!entry) {
    failures.push(
      `latest.json has no entry for ${platform}. The updater reads this key ` +
        "on that architecture, and a missing one makes every check do nothing.",
    );
    continue;
  }
  if (!entry.signature)
    failures.push(`latest.json signs nothing for ${platform}`);
  if (!entry.url)
    failures.push(`latest.json carries no download url for ${platform}`);
}

// Catches a manifest attached to the wrong tag, which offers users a build that
// is not the one the release claims to hold.
if (tag && manifest.version && `v${manifest.version}` !== tag) {
  failures.push(
    `latest.json says version ${manifest.version} but the tag is ${tag}`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  process.exit(1);
}

for (const platform of platforms) {
  const asset = manifest.platforms[platform].url.split("/").pop();
  console.log(`✓ latest.json signs ${platform} -> ${asset}`);
}
