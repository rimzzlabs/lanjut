import { A, G, O, pipe, R } from "@mobily/ts-belt";
import type { Resume, ResumeIndexEntry } from "..";
import {
  CURRENT_SCHEMA_VERSION,
  needsMigration,
  readSchemaVersion,
  runMigrations,
} from "..";
import { getDb, META_KEYS } from "./schema";

export interface ResumeIndexResult {
  entries: readonly ResumeIndexEntry[];
  /**
   * Documents that failed migration, typically written by a newer app build
   * than the one currently running. They stay untouched in the store.
   */
  unreadableCount: number;
}

type Db = Awaited<ReturnType<typeof getDb>>;

/**
 * Snapshot the raw pre-migration document before the migrated shape has any
 * chance of being persisted over it, so a buggy ladder step is recoverable.
 * Idempotent per (id, version): re-reads overwrite the same key.
 */
async function backupRawResume(db: Db, raw: unknown): Promise<void> {
  const id = (raw as { id?: unknown }).id;
  if (!G.isString(id)) return;
  const version = readSchemaVersion(raw);
  await db.put(
    "backups",
    {
      resumeId: id,
      schemaVersion: version,
      backedUpAt: new Date().toISOString(),
      doc: raw,
    },
    `${id}@v${version}`,
  );
}

/** A newer app build migrated the stored copy, so this build must not write over it. */
export type PutResumeError = "newer-schema";

/**
 * Persist a whole Resume document. Resolves once the write transaction has
 * committed, so callers can await it as a flush primitive (e.g. on resume-switch
 * or page-hide). The store owns updatedAt stamping; the repository persists as-is.
 * A tab on an older build can hold a résumé that a newer build has since
 * migrated, and writing it back drops the newer fields, so a newer copy stays.
 */
export async function putResume(
  resume: Resume,
): Promise<R.Result<Resume, PutResumeError>> {
  const db = await getDb();
  const tx = db.transaction("resumes", "readwrite");
  const stored = await tx.store.get(resume.id);
  if (readSchemaVersion(stored) > CURRENT_SCHEMA_VERSION) {
    await tx.done;
    return R.makeError("newer-schema");
  }
  await Promise.all([tx.store.put(resume), tx.done]);
  return R.makeOk(resume);
}

/**
 * Read one Resume, stepped up through the migration ladder before returning.
 * Backs up the raw document first when a migration will run. Returns undefined
 * when the document cannot be migrated (e.g. written by a newer app build); the
 * raw document stays on disk untouched.
 */
export async function getResume(id: string): Promise<Resume | undefined> {
  const db = await getDb();
  const raw = await db.get("resumes", id);
  if (!raw) return undefined;
  if (needsMigration(raw)) await backupRawResume(db, raw);
  return R.toUndefined(runMigrations(raw));
}

export async function deleteResume(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("resumes", id);
  // Import leftovers are keyed by the same id; drop them with the document.
  await db.delete("leftovers", id);
}

/** The index fields of one stored document, or None when it fails to migrate. */
async function readIndexEntry(
  db: Db,
  raw: unknown,
): Promise<O.Option<ResumeIndexEntry>> {
  // A failed backup marks this one document unreadable, never the whole Library.
  if (needsMigration(raw)) {
    const saved = await backupRawResume(db, raw).then(
      () => true,
      () => false,
    );
    if (!saved) return O.None;
  }
  return pipe(
    runMigrations(raw),
    R.toOption,
    O.map((resume) => ({
      id: resume.id,
      title: resume.title,
      updatedAt: resume.updatedAt,
      profileId: resume.profileId,
    })),
  );
}

/**
 * The lightweight Library projection (id, title, updatedAt, profileId), newest first. Reads
 * full bodies to migrate them, but returns only index fields; the full body of a
 * non-open Resume is not kept in memory. Migration failures are isolated per
 * document and counted, never deleted: one unreadable document must not make the
 * whole Library look empty.
 */
export async function listResumeIndex(): Promise<ResumeIndexResult> {
  const db = await getDb();
  // getAll, not the by-updatedAt index: a document missing the indexed key would
  // be silently absent from an index scan, which reads as data loss.
  const all = await db.getAll("resumes");

  // Sequential on purpose: each backup lands before its document migrates.
  let entries: ReadonlyArray<ResumeIndexEntry> = [];
  let unreadableCount = 0;
  for (const raw of all) {
    const entry = await readIndexEntry(db, raw);
    if (O.isSome(entry)) entries = A.append(entries, entry);
    else unreadableCount += 1;
  }

  return {
    entries: pipe(
      entries,
      A.sortBy((entry) => entry.updatedAt),
      A.reverse,
    ),
    unreadableCount,
  };
}

export async function getLastOpenedResumeId(): Promise<string | null> {
  const db = await getDb();
  return (await db.get("app", META_KEYS.lastOpenedResumeId)) ?? null;
}

export async function setLastOpenedResumeId(id: string): Promise<void> {
  const db = await getDb();
  await db.put("app", id, META_KEYS.lastOpenedResumeId);
}
