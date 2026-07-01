import { G } from "@mobily/ts-belt";
import { CURRENT_SCHEMA_VERSION, type Resume } from "./types";

/** A persisted document of unknown/older shape, before migration. */
type ResumeDoc = Record<string, unknown>;

/**
 * A forward-only migration from version N to N+1, keyed by N. Each step is a pure
 * JSON→JSON function over a plain document, testable with fixtures — never runs
 * inside idb's onupgradeneeded (that governs store structure only; see ADR-0002).
 */
type Migration = (doc: ResumeDoc) => ResumeDoc;

/**
 * The migration ladder. Empty at schemaVersion 1 — the harness exists from v1 so
 * the first real field-shape change (the presentation token block, planned for
 * v1→v2) only has to add a `1: (doc) => ({ ...doc, presentation: DEFAULTS })`
 * entry plus a fixture test, with no other read-path changes.
 */
const LADDER: Record<number, Migration> = {};

function readVersion(doc: ResumeDoc): number {
  return G.isNumber(doc.schemaVersion) ? doc.schemaVersion : 0;
}

/**
 * Step a persisted document up to the current schema version. Run at read time,
 * per document. Throws on a document written by a newer app version (no forward
 * compatibility) or a missing ladder rung (a version gap that should never ship).
 */
export function runMigrations(raw: unknown): Resume {
  let doc = raw as ResumeDoc;
  let version = readVersion(doc);

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Resume schemaVersion ${version} is newer than supported ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  while (version < CURRENT_SCHEMA_VERSION) {
    const step = LADDER[version];
    if (!step) {
      throw new Error(`No migration registered from schemaVersion ${version}.`);
    }
    doc = step(doc);
    version += 1;
    doc.schemaVersion = version;
  }

  return doc as unknown as Resume;
}

/** Whether a persisted document is below the current version and will be migrated. */
export function needsMigration(raw: unknown): boolean {
  return readVersion(raw as ResumeDoc) < CURRENT_SCHEMA_VERSION;
}
