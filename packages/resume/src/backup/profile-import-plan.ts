import { A, D, O, pipe } from "@mobily/ts-belt";
import { headerToInterchange } from "../interchange/codec";
import { tiptapToMarkdown } from "../interchange/markdown";
import { isProfileEmpty, type Profile } from "../profile";
import type { Resume } from "../types";
import type { ProfileBackup } from "./profile-backup";

/** What this device holds, to compare a backup against. */
export interface LocalLibrary {
  profiles: ReadonlyArray<Profile>;
  /** Every résumé on the device, from any profile. */
  resumes: ReadonlyArray<{ id: string; updatedAt: string }>;
}

/**
 * - `add`: the profile is new on this device.
 * - `same`: this device has it, with the same details.
 * - `update`: the file's details replace this device's.
 * - `keep`: this device's details are as new as the file's, or newer.
 */
export type ProfileImportAction = "add" | "same" | "update" | "keep";

export interface ProfileImportPlan {
  profile: Profile;
  profileAction: ProfileImportAction;
  /** Résumés this device does not have. */
  add: ReadonlyArray<Resume>;
  /** Résumés whose copy in the file is newer than this device's. */
  update: ReadonlyArray<Resume>;
  /** Résumés this device already has, as new as the file's or newer. */
  keep: number;
}

function isNewer(candidate: string, current: string): boolean {
  return Date.parse(candidate) > Date.parse(current);
}

/** The details a person sees, in a form two devices write alike. */
function detailsOf(profile: Profile): string {
  return JSON.stringify([
    profile.name,
    headerToInterchange(profile.header),
    profile.header.photo ?? "",
    tiptapToMarkdown(profile.summary),
  ]);
}

function profileActionOf(
  incoming: Profile,
  profiles: ReadonlyArray<Profile>,
): ProfileImportAction {
  return pipe(
    A.find(profiles, (profile) => profile.id === incoming.id),
    O.match(
      (local) => {
        if (detailsOf(local) === detailsOf(incoming)) return "same";
        // An empty profile, such as the unsaved guest on a new device, has
        // nothing to keep or replace, whatever its edit time says.
        if (isProfileEmpty(local)) return "add";
        return isNewer(incoming.updatedAt, local.updatedAt) ? "update" : "keep";
      },
      () => "add",
    ),
  );
}

/**
 * How a backup merges into this device. Nothing here is ever deleted: a
 * résumé the file lacks stays, and where both have one, the newer edit wins.
 */
export function planProfileImport(
  backup: ProfileBackup,
  local: LocalLibrary,
): ProfileImportPlan {
  const updatedAt = D.fromPairs(
    A.map(local.resumes, (entry) => [entry.id, entry.updatedAt] as const),
  );
  const isNew = (resume: Resume) => O.isNone(D.get(updatedAt, resume.id));
  const isNewerInFile = (resume: Resume) =>
    pipe(
      D.get(updatedAt, resume.id),
      O.mapWithDefault(false, (current) => isNewer(resume.updatedAt, current)),
    );
  const add = A.filter(backup.resumes, isNew);
  const update = A.filter(backup.resumes, isNewerInFile);
  return {
    profile: backup.profile,
    profileAction: profileActionOf(backup.profile, local.profiles),
    add,
    update,
    keep: A.length(backup.resumes) - A.length(add) - A.length(update),
  };
}
