import { type ResumeIndexEntry, resolveResumeProfileId } from "@lanjut/resume";
import { A, D, O } from "@mobily/ts-belt";
import { useMemo } from "react";
import { useTranslations } from "use-intl";
import {
  selectActiveProfile,
  useProfileStore,
  useResumeStore,
} from "@/lib/store";

/** The library of the active profile, newest first. */
export function useProfileResumes(): ReadonlyArray<ResumeIndexEntry> {
  const index = useResumeStore((state) => state.index);
  const profiles = useProfileStore((state) => state.profiles);
  const activeId = useProfileStore((state) => selectActiveProfile(state).id);

  return useMemo(
    () =>
      A.filter(
        index,
        (entry) =>
          resolveResumeProfileId(entry.profileId, profiles) === activeId,
      ),
    [index, profiles, activeId],
  );
}

/** How many résumés each profile holds, keyed by profile id. */
export function useProfileResumeCounts(): Readonly<Record<string, number>> {
  const index = useResumeStore((state) => state.index);
  const profiles = useProfileStore((state) => state.profiles);

  return useMemo(
    () =>
      A.reduce(index, {} as Record<string, number>, (counts, entry) => {
        const id = resolveResumeProfileId(entry.profileId, profiles);
        return D.set(counts, id, O.getWithDefault(D.get(counts, id), 0) + 1);
      }),
    [index, profiles],
  );
}

/** True once both the library and the profiles have loaded. */
export function useProfileLibraryReady(): boolean {
  const indexStatus = useResumeStore((state) => state.indexStatus);
  const profileStatus = useProfileStore((state) => state.status);
  return (
    indexStatus === "ready" &&
    (profileStatus === "ready" || profileStatus === "error")
  );
}

/** How many résumés the active profile holds, or null until both stores load. */
export function useProfileResumeCount(): number | null {
  const ready = useProfileLibraryReady();
  const resumes = useProfileResumes();
  if (!ready) return null;
  return A.length(resumes);
}

/**
 * "3 resumes" for one profile, or an empty string until the library loads,
 * so a count never reads "No resumes" before it is known.
 */
export function useProfileResumeCountText(id: string): string {
  const t = useTranslations("profile");
  const counts = useProfileResumeCounts();
  const ready = useResumeStore((state) => state.indexStatus === "ready");
  if (!ready) return "";
  return t("resumeCount", { count: O.getWithDefault(D.get(counts, id), 0) });
}
