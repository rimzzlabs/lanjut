import { type ResumeIndexEntry, resolveResumeProfileId } from "@lanjut/resume";
import { A, O, pipe, R } from "@mobily/ts-belt";
import {
  selectActiveProfile,
  useProfileStore,
} from "@/lib/store/profile-store";
import { useResumeStore } from "@/lib/store/resume-store";

/** What `lanjut_list_resumes` gives the assistant. No résumé text. */
interface ResumeList {
  profile: { id: string; name: string };
  resumes: ReadonlyArray<{ id: string; title: string; updatedAt: string }>;
}

const UNREADABLE = "Lanjut could not read its storage. Restart Lanjut.";

/** The window can be on any page, so the library may not be loaded yet. */
async function readyLibrary(): Promise<boolean> {
  const profiles = useProfileStore.getState();
  const resumes = useResumeStore.getState();
  await Promise.all([
    profiles.status === "ready" ? undefined : profiles.hydrate(),
    resumes.indexStatus === "ready" ? undefined : resumes.hydrateIndex(),
  ]);
  return useResumeStore.getState().indexStatus === "ready";
}

function activeEntries(): ReadonlyArray<ResumeIndexEntry> {
  const profileState = useProfileStore.getState();
  const active = selectActiveProfile(profileState);
  return A.filter(
    useResumeStore.getState().index,
    (entry) =>
      resolveResumeProfileId(entry.profileId, profileState.profiles) ===
      active.id,
  );
}

export async function listResumes(): Promise<R.Result<ResumeList, string>> {
  if (!(await readyLibrary())) return R.makeError(UNREADABLE);
  const active = selectActiveProfile(useProfileStore.getState());
  return R.makeOk({
    profile: { id: active.id, name: active.name },
    resumes: pipe(
      activeEntries(),
      A.map((entry) => ({
        id: entry.id,
        title: entry.title,
        updatedAt: entry.updatedAt,
      })),
    ),
  });
}

/**
 * A résumé of the active profile. The assistant sees only those, as the
 * library does.
 */
export async function findResume(
  id: string,
): Promise<R.Result<ResumeIndexEntry, string>> {
  if (!(await readyLibrary())) return R.makeError(UNREADABLE);
  return pipe(
    A.find(activeEntries(), (entry) => entry.id === id),
    O.toResult(
      `The active profile has no résumé with the id ${id}. Call lanjut_list_resumes for the ids.`,
    ),
  );
}
