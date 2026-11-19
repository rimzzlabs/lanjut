// Builds the lanjut-mcp relay and puts it where Tauri's externalBin expects it:
// src-tauri/binaries/lanjut-mcp-<target triple>. It must run before cargo builds
// the app, because tauri-build refuses to build when an externalBin is missing.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const tauriDir = join(dirname(fileURLToPath(import.meta.url)), "../src-tauri");

function hostTriple() {
  const info = execFileSync("rustc", ["-vV"], { encoding: "utf8" });
  const line = info.split("\n").find((entry) => entry.startsWith("host: "));
  if (!line) throw new Error("rustc -vV printed no host triple");
  return line.slice("host: ".length).trim();
}

// Tauri sets these for its before commands. A plain run builds for the host.
const triple = process.env.TAURI_ENV_TARGET_TRIPLE || hostTriple();
const release =
  process.env.TAURI_ENV_DEBUG !== "true" && !process.argv.includes("--debug");
const profile = release ? "release" : "debug";
const exe = triple.includes("windows") ? ".exe" : "";

execFileSync(
  "cargo",
  [
    "build",
    "--package",
    "lanjut-mcp",
    "--bin",
    "lanjut-mcp",
    "--target",
    triple,
    ...(release ? ["--release"] : []),
  ],
  { cwd: tauriDir, stdio: "inherit" },
);

const built = join(tauriDir, "target", triple, profile, `lanjut-mcp${exe}`);
const binaries = join(tauriDir, "binaries");
mkdirSync(binaries, { recursive: true });
copyFileSync(built, join(binaries, `lanjut-mcp-${triple}${exe}`));
