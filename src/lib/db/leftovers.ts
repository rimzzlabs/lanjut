import { getDb } from "./schema";

/**
 * Persist the unplaceable text chunks from a PDF import, keyed by the résumé's
 * id. An empty list clears the entry (nothing left to surface).
 */
export async function putLeftovers(
  resumeId: string,
  items: string[],
): Promise<void> {
  const db = await getDb();
  if (items.length === 0) {
    await db.delete("leftovers", resumeId);
    return;
  }
  await db.put("leftovers", { resumeId, items });
}

/** The leftover chunks for a résumé, or an empty list when there are none. */
export async function getLeftovers(resumeId: string): Promise<string[]> {
  const db = await getDb();
  const record = await db.get("leftovers", resumeId);
  return record?.items ?? [];
}

/** Drop a résumé's leftovers (e.g. after the user clears or deletes the doc). */
export async function deleteLeftovers(resumeId: string): Promise<void> {
  const db = await getDb();
  await db.delete("leftovers", resumeId);
}
