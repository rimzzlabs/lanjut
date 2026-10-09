import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// A pull request whose title release-please turns into a release must add the
// changelog entry for the version that release will carry. The release PR
// itself opens with the default token, so no check ever runs on it: the entry
// has to arrive with the change. Run with TITLE (the PR title), BODY (the PR
// description, which becomes the squash commit's body), LABELS (a JSON array of
// label names), and BASE_REF (the base branch).

const CHANGELOG_FILE = "apps/web/src/lib/changelog.ts";
const LOCALES = ["en", "id"];
const SKIP_LABEL = "no-changelog";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function readJson(path, ref) {
  const text = ref ? git("show", `${ref}:${path}`) : readFileSync(path, "utf8");
  return JSON.parse(text);
}

// release-please-config.json turns pre-major bumps off, so a breaking change
// moves the major version even before 1.0.
function bumpOf(subject) {
  const match = /^(\w+)(?:\([^)]*\))?(!)?:/.exec(subject);
  if (!match) return null;
  if (match[2]) return "major";
  if (match[1] === "feat") return "minor";
  if (match[1] === "fix" || match[1] === "perf") return "patch";
  return null;
}

const RANK = { patch: 1, minor: 2, major: 3 };

function bump(version, level) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (level === "major") return `${major + 1}.0.0`;
  if (level === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function highest(levels) {
  return levels
    .filter(Boolean)
    .reduce(
      (top, level) => (RANK[level] > (RANK[top] ?? 0) ? level : top),
      null,
    );
}

const keyOf = (version) => version.replaceAll(".", "_");

// A "Release-As: x.y.z" line in a commit body makes release-please cut exactly
// that version, whatever the commit type.
function releaseAsOf(text) {
  return /^release-as:\s*v?(\d+\.\d+\.\d+)\s*$/im.exec(text)?.[1] ?? null;
}

const title = process.env.TITLE ?? "";
const labels = JSON.parse(process.env.LABELS || "[]");
const base = `origin/${process.env.BASE_REF || "main"}`;

const released = readJson(".release-please-manifest.json", base)["."];
const pending = git("log", `v${released}..${base}`, "--format=%s")
  .split("\n")
  .filter(Boolean);
const ownBump = bumpOf(title);
const ownReleaseAs = releaseAsOf(process.env.BODY ?? "");
const releaseAs =
  ownReleaseAs ??
  releaseAsOf(git("log", `v${released}..${base}`, "--format=%B"));
const pendingBump = highest([...pending.map(bumpOf), ownBump]);
const next = releaseAs ?? (pendingBump ? bump(released, pendingBump) : null);
const ownReleases = Boolean(ownBump || ownReleaseAs);

const versions = [
  ...readFileSync(CHANGELOG_FILE, "utf8").matchAll(/version: "([\d.]+)"/g),
].map((match) => match[1]);
const tags = new Set(
  git("tag", "--list", "v*")
    .split("\n")
    .map((tag) => tag.slice(1)),
);
const entries = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    readJson(`packages/i18n/messages/${locale}.json`).platform.changelog
      .entries,
  ]),
);
const failures = [];

for (const version of versions) {
  if (!tags.has(version) && version !== next) {
    failures.push(
      `${CHANGELOG_FILE} lists ${version}, which is not a release and is not the next one (${next ?? "none pending"}). Rename it to the next version.`,
    );
  }
  for (const locale of LOCALES) {
    if (!entries[locale][keyOf(version)]?.length) {
      failures.push(
        `${locale}.json has no platform.changelog.entries.${keyOf(version)} for ${version}.`,
      );
    }
  }
}

if (ownReleases && !labels.includes(SKIP_LABEL)) {
  if (!versions.includes(next)) {
    failures.push(
      `"${title}" goes into release ${next}. Add { version: "${next}", date } to ${CHANGELOG_FILE}.`,
    );
  }
  for (const locale of LOCALES) {
    const path = `packages/i18n/messages/${locale}.json`;
    const before = readJson(path, base).platform.changelog.entries[keyOf(next)];
    const after = entries[locale][keyOf(next)];
    if (JSON.stringify(before) === JSON.stringify(after)) {
      failures.push(
        `"${title}" adds nothing to ${path} at platform.changelog.entries.${keyOf(next)}. Add a highlight, or fold a fix into the "Bug fixes" entry.`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  console.error(
    `\nIf the change is not visible to people who use Lanjut, add the "${SKIP_LABEL}" label.`,
  );
  process.exit(1);
}

if (ownReleases && labels.includes(SKIP_LABEL)) {
  console.log(`Skipped: the "${SKIP_LABEL}" label is set.`);
} else if (next) {
  console.log(`Changelog is ready for ${next}.`);
} else {
  console.log("No release is pending. The changelog is consistent.");
}
