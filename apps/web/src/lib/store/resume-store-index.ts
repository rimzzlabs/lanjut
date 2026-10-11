import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import { A, pipe } from "@mobily/ts-belt";

function toIndexEntry(resume: Resume): ResumeIndexEntry {
  return {
    id: resume.id,
    title: resume.title,
    updatedAt: resume.updatedAt,
    profileId: resume.profileId,
  };
}

/** Data-last: moves a résumé or an index entry listed in `ids` to the profile. */
export function withProfileId<T extends { id: string; profileId?: string }>(
  ids: ReadonlyArray<string>,
  profileId: string,
): (item: T) => T {
  return (item) => {
    if (!A.includes(ids, item.id)) return item;
    return { ...item, profileId };
  };
}

/** Upsert the given Resume's projection into the index, keeping newest-first order. */
export function syncIndexEntry(
  index: readonly ResumeIndexEntry[],
  resume: Resume,
): readonly ResumeIndexEntry[] {
  return pipe(
    index,
    A.reject((item) => item.id === resume.id),
    A.prepend(toIndexEntry(resume)),
    A.sortBy((entry) => entry.updatedAt),
    A.reverse,
  );
}
