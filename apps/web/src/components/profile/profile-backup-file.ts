import { type Profile, resolveResumeProfileId } from "@lanjut/resume";
import type { ProfileBackupError } from "@lanjut/resume/backup/profile-backup";
import type { ProfileImportPlan } from "@lanjut/resume/backup/profile-import-plan";
import { getResume } from "@lanjut/resume/db";
import { A, G, pipe, R } from "@mobily/ts-belt";
import { safeFileName } from "@/components/editor/download-file";
import { useProfileStore, useResumeStore } from "@/lib/store";

/** `.json` last, so every file picker and save dialog takes the file. */
const EXTENSION = ".lanjut.json";

// A profile backup holds text and a few photos; a file far past this is
// something else, and reading it would only stall the page.
const MAX_BYTES = 25 * 1024 * 1024;

export type ProfileImportError = ProfileBackupError | "unreadable" | "tooLarge";

async function readyLibrary() {
  const resumes = useResumeStore.getState();
  await resumes.flush();
  if (resumes.indexStatus !== "ready") await resumes.hydrateIndex();
  return {
    profiles: useProfileStore.getState().profiles,
    index: useResumeStore.getState().index,
  };
}

/** The profile and its résumés as saved, after any pending edit lands. */
export async function buildProfileBackup(
  profile: Profile,
  label: string,
): Promise<File> {
  const { profileBackupToJson } = await import(
    "@lanjut/resume/backup/profile-backup"
  );
  const { profiles, index } = await readyLibrary();
  const ids = pipe(
    index,
    A.filter(
      (entry) =>
        resolveResumeProfileId(entry.profileId, profiles) === profile.id,
    ),
    A.map((entry) => entry.id),
  );
  // An unreadable résumé is left out rather than failing the whole backup.
  const documents = await Promise.all(
    A.map(ids, (id) => getResume(id).catch(() => undefined)),
  );
  const json = profileBackupToJson(
    profile,
    A.filter(documents, G.isNotNullable),
    new Date().toISOString(),
  );
  return new File([json], `${safeFileName(label)}${EXTENSION}`, {
    type: "application/json",
  });
}

/**
 * The backup to hand to the share sheet: the same JSON, named `.txt`. Chrome
 * shares only a fixed list of file types, JSON not among them, and refuses
 * the share outright; plain text goes through every share sheet. The import
 * reads the content, whatever the name.
 */
export function shareableBackup(file: File): File {
  const name = file.name.replace(/\.json$/, ".txt");
  return new File([file], name, { type: "text/plain" });
}

/** The file types the import picker offers: the backup under either name. */
export const BACKUP_ACCEPT = ".json,.txt,application/json,text/plain";

/** Reads a backup file and works out what importing it would change. */
export async function planBackupImport(
  file: File,
): Promise<R.Result<ProfileImportPlan, ProfileImportError>> {
  if (file.size > MAX_BYTES) return R.makeError("tooLarge");
  const text = await file.text().catch(() => undefined);
  if (text === undefined) return R.makeError("unreadable");
  const [{ parseProfileBackup }, { planProfileImport }] = await Promise.all([
    import("@lanjut/resume/backup/profile-backup"),
    import("@lanjut/resume/backup/profile-import-plan"),
  ]);
  const { profiles, index } = await readyLibrary();
  return R.map(parseProfileBackup(text), (backup) =>
    planProfileImport(backup, { profiles, resumes: index }),
  );
}

/** Writes what the plan adds and updates, then makes the profile active. */
export async function applyBackupImport(plan: ProfileImportPlan) {
  await useProfileStore
    .getState()
    .importProfile(
      plan.profile,
      plan.profileAction === "keep" || plan.profileAction === "same",
    );
  await useResumeStore
    .getState()
    .importResumes(A.concat(plan.add, plan.update));
}
