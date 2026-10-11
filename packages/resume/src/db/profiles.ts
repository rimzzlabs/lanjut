import { A, type R } from "@mobily/ts-belt";
import type { Profile } from "../profile";
import {
  type ExpectedRevision,
  type RevisionError,
  writeRevised,
} from "./revision";
import { getDb, META_KEYS } from "./schema";

/** Every saved profile, oldest first. */
export async function listProfiles(): Promise<ReadonlyArray<Profile>> {
  const db = await getDb();
  const profiles = await db.getAll("profiles");
  return A.sort(profiles, (a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Save a profile with the next revision; see `writeRevised`. */
export async function putProfile(
  profile: Profile,
  expected: ExpectedRevision,
): Promise<R.Result<Profile, RevisionError>> {
  const db = await getDb();
  const tx = db.transaction("profiles", "readwrite");
  return writeRevised({
    store: tx.store,
    done: tx.done,
    value: profile,
    expected,
  });
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("profiles", id);
}

export async function getActiveProfileId(): Promise<string | null> {
  const db = await getDb();
  return (await db.get("app", META_KEYS.activeProfileId)) ?? null;
}

export async function setActiveProfileId(id: string): Promise<void> {
  const db = await getDb();
  await db.put("app", id, META_KEYS.activeProfileId);
}
