import { A, pipe } from "@mobily/ts-belt";
import type { Resume, ResumeIndexEntry } from "@/lib/resume";
import { runMigrations } from "@/lib/resume";
import { getDb, META_KEYS } from "./schema";

/**
 * Persist a whole Resume document. Resolves once the write transaction has
 * committed, so callers can await it as a flush primitive (e.g. on resume-switch
 * or page-hide). The store owns updatedAt stamping; the repository persists as-is.
 */
export async function putResume(resume: Resume): Promise<void> {
  const db = await getDb();
  await db.put("resumes", resume);
}

/** Read one Resume, stepped up through the migration ladder before returning. */
export async function getResume(id: string): Promise<Resume | undefined> {
  const db = await getDb();
  const raw = await db.get("resumes", id);
  return raw ? runMigrations(raw) : undefined;
}

export async function deleteResume(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("resumes", id);
}

/**
 * The lightweight Library projection (id, title, updatedAt), newest first. Reads
 * full bodies to migrate them, but returns only index fields — the full body of a
 * non-open Resume is not kept in memory.
 */
export async function listResumeIndex(): Promise<readonly ResumeIndexEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("resumes", "by-updatedAt");
  return pipe(
    all,
    A.map((raw) => {
      const resume = runMigrations(raw);
      return {
        id: resume.id,
        title: resume.title,
        updatedAt: resume.updatedAt,
      };
    }),
    A.sortBy((entry) => entry.updatedAt),
    A.reverse,
  );
}

export async function getLastOpenedResumeId(): Promise<string | null> {
  const db = await getDb();
  return (await db.get("app", META_KEYS.lastOpenedResumeId)) ?? null;
}

export async function setLastOpenedResumeId(id: string): Promise<void> {
  const db = await getDb();
  await db.put("app", id, META_KEYS.lastOpenedResumeId);
}
