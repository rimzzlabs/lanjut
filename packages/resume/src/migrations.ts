import { A, G, O, R } from "@mobily/ts-belt";
import type { ResumeDoc } from "./migrations-shared";
import {
  migrateV1toV2,
  migrateV2toV3,
  migrateV3toV4,
  migrateV4toV5,
  migrateV5toV6,
  migrateV6toV7,
  migrateV7toV8,
  migrateV8toV9,
  migrateV9toV10,
  migrateV10toV11,
} from "./migrations-v1-v11";
import {
  migrateV11toV12,
  migrateV12toV13,
  migrateV13toV14,
  migrateV14toV15,
  migrateV15toV16,
  migrateV16toV17,
  migrateV17toV18,
  migrateV18toV19,
  migrateV19toV20,
  migrateV20toV21,
  migrateV21toV22,
  migrateV22toV23,
  migrateV23toV24,
  migrateV24toV25,
} from "./migrations-v11-v25";
import { CURRENT_SCHEMA_VERSION, type Resume } from "./types";

/**
 * A forward-only migration from version N to N+1, keyed by N. Each step is a pure
 * JSON→JSON function over a plain document, testable with fixtures; never runs
 * inside idb's onupgradeneeded (that governs store structure only; see
 * docs/schema-migrations.md). Steps must bail out (keep the original data) when a
 * document does not match the shape they expect: a mis-stamped schemaVersion
 * must degrade to a no-op, never to blanked or replaced fields.
 */
type Migration = (doc: ResumeDoc) => ResumeDoc;

/**
 * The migration ladder. Each key N is a forward-only step from version N to N+1.
 */
const LADDER: Record<number, Migration> = {
  1: migrateV1toV2,
  2: migrateV2toV3,
  3: migrateV3toV4,
  4: migrateV4toV5,
  5: migrateV5toV6,
  6: migrateV6toV7,
  7: migrateV7toV8,
  8: migrateV8toV9,
  9: migrateV9toV10,
  10: migrateV10toV11,
  11: migrateV11toV12,
  12: migrateV12toV13,
  13: migrateV13toV14,
  14: migrateV14toV15,
  15: migrateV15toV16,
  16: migrateV16toV17,
  17: migrateV17toV18,
  18: migrateV18toV19,
  19: migrateV19toV20,
  20: migrateV20toV21,
  21: migrateV21toV22,
  22: migrateV22toV23,
  23: migrateV23toV24,
  24: migrateV24toV25,
};

/** The persisted schemaVersion of a raw document; 0 when absent or malformed. */
export function readSchemaVersion(raw: unknown): number {
  const doc = raw as ResumeDoc | null | undefined;
  return G.isNumber(doc?.schemaVersion) ? doc.schemaVersion : 0;
}

/**
 * Step a persisted document up to the current schema version. Run at read time,
 * per document. Fails on a document written by a newer app version (no forward
 * compatibility) or a missing ladder rung (a version gap that should never ship).
 */
export function runMigrations(raw: unknown): R.Result<Resume, string> {
  const start = readSchemaVersion(raw);
  if (start > CURRENT_SCHEMA_VERSION) {
    return R.makeError(
      `Resume schemaVersion ${start} is newer than supported ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  const migrated = A.reduce(
    A.range(start, CURRENT_SCHEMA_VERSION - 1),
    R.makeOk<ResumeDoc, string>(raw as ResumeDoc),
    (result, version) => R.flatMap(result, (doc) => stepUp(doc, version)),
  );
  return R.map(migrated, (doc) => doc as unknown as Resume);
}

/** Runs the ladder rung for `version`, or fails when none is registered. */
function stepUp(doc: ResumeDoc, version: number): R.Result<ResumeDoc, string> {
  return O.match(
    O.fromNullable(LADDER[version]),
    (step) => R.makeOk({ ...step(doc), schemaVersion: version + 1 }),
    () => R.makeError(`No migration registered from schemaVersion ${version}.`),
  );
}

/** Whether a persisted document is below the current version and will be migrated. */
export function needsMigration(raw: unknown): boolean {
  return readSchemaVersion(raw) < CURRENT_SCHEMA_VERSION;
}
