import { A, D, F, G, O, pipe, R } from "@mobily/ts-belt";
import {
  headerFromInterchange,
  headerToInterchange,
  resumeToInterchange,
} from "../interchange/codec";
import { importParsedResume } from "../interchange/import-file";
import { markdownToTiptap, tiptapToMarkdown } from "../interchange/markdown";
import { INTERCHANGE_FORMAT } from "../interchange/schema";
import { validateInterchange } from "../interchange/validate";
import type { Profile } from "../profile";
import type { Resume } from "../types";
import {
  PROFILE_BACKUP_FORMAT,
  PROFILE_BACKUP_VERSION,
  type ProfileBackupFile,
  profileBackupSchema,
} from "./profile-backup-schema";

/** A profile and its résumés, read back from a backup file. */
export interface ProfileBackup {
  profile: Profile;
  /** Full résumés with the file's ids and edit times, owned by `profile`. */
  resumes: ReadonlyArray<Resume>;
}

/**
 * Why a file did not import. `resumeFile` is a single résumé's JSON, which
 * belongs in the editor's import; `newerVersion` came from a newer app.
 */
export type ProfileBackupError =
  | "syntax"
  | "resumeFile"
  | "notBackup"
  | "newerVersion"
  | "invalid";

type PhotoKeys = Readonly<Record<string, string>>;

function photoKeyOf(keys: PhotoKeys, photo: string | undefined) {
  return photo === undefined ? undefined : keys[photo];
}

/**
 * One profile and its résumés as compact JSON. Each photo is stored once
 * under a key and the profile and résumés point to it, since a person's
 * résumés usually share one portrait and it outweighs their text.
 */
export function profileBackupToJson(
  profile: Profile,
  resumes: ReadonlyArray<Resume>,
  exportedAt: string,
): string {
  const photoList = pipe(
    A.prepend(
      A.map(resumes, (resume) => resume.header.photo),
      profile.header.photo,
    ),
    A.filter(G.isString),
    A.uniq,
  );
  const keys: PhotoKeys = D.fromPairs(
    A.mapWithIndex(photoList, (index, photo) => [photo, `p${index}`] as const),
  );
  const file: ProfileBackupFile = {
    format: PROFILE_BACKUP_FORMAT,
    version: PROFILE_BACKUP_VERSION,
    exportedAt,
    profile: {
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      header: headerToInterchange(profile.header),
      photo: photoKeyOf(keys, profile.header.photo),
      summary: tiptapToMarkdown(profile.summary),
    },
    photos: D.fromPairs(
      A.mapWithIndex(
        photoList,
        (index, photo) => [`p${index}`, photo] as const,
      ),
    ),
    resumes: F.toMutable(
      A.map(resumes, (resume) => ({
        id: resume.id,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        photo: photoKeyOf(keys, resume.header.photo),
        resume: D.deleteKey(resumeToInterchange(resume), "photo"),
      })),
    ),
  };
  return JSON.stringify(file);
}

type BackupResume = ProfileBackupFile["resumes"][number];

function photoOf(
  photos: PhotoKeys,
  key: string | undefined,
): R.Result<string | undefined, ProfileBackupError> {
  if (key === undefined) return R.makeOk(undefined);
  return pipe(
    D.get(photos, key),
    O.match(
      (photo): R.Result<string | undefined, ProfileBackupError> =>
        R.makeOk(photo),
      () => R.makeError("invalid"),
    ),
  );
}

// Interchange fills what a résumé document leaves out; these only matter
// for a document with no template or language of its own.
const FALLBACK = { title: "", language: "en", templateId: "awal" } as const;

function decodeResume(
  item: BackupResume,
  photos: PhotoKeys,
  profileId: string,
): R.Result<Resume, ProfileBackupError> {
  return pipe(
    photoOf(photos, item.photo),
    R.flatMap((photo) => {
      const parsed = validateInterchange({ ...item.resume, photo });
      const imported = importParsedResume(parsed, FALLBACK);
      if (!imported.ok)
        return R.makeError<Resume, ProfileBackupError>("invalid");
      return R.makeOk<Resume, ProfileBackupError>({
        ...imported.resume,
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        profileId,
      });
    }),
  );
}

/** The format and version a JSON value claims, before the full check. */
function claimOf(data: unknown): { format: unknown; version: unknown } {
  if (!G.isObject(data)) return { format: undefined, version: undefined };
  const record = data as Record<string, unknown>;
  return { format: record.format, version: record.version };
}

function checkClaim(data: unknown): R.Result<unknown, ProfileBackupError> {
  const claim = claimOf(data);
  if (claim.format === INTERCHANGE_FORMAT) return R.makeError("resumeFile");
  if (claim.format !== PROFILE_BACKUP_FORMAT) return R.makeError("notBackup");
  if (G.isNumber(claim.version) && claim.version > PROFILE_BACKUP_VERSION) {
    return R.makeError("newerVersion");
  }
  return R.makeOk(data);
}

function decodeFile(
  file: ProfileBackupFile,
): R.Result<ProfileBackup, ProfileBackupError> {
  const photos: PhotoKeys = file.photos ?? {};
  const decoded = A.map(file.resumes, (item) =>
    decodeResume(item, photos, file.profile.id),
  );
  // One bad résumé rejects the file, as one bad field rejects a résumé.
  if (A.some(decoded, R.isError)) return R.makeError("invalid");
  return pipe(
    photoOf(photos, file.profile.photo),
    R.map(
      (photo): ProfileBackup => ({
        profile: {
          id: file.profile.id,
          name: file.profile.name,
          createdAt: file.profile.createdAt,
          updatedAt: file.profile.updatedAt,
          header: headerFromInterchange(file.profile.header, photo),
          summary: markdownToTiptap(file.profile.summary ?? ""),
        },
        resumes: A.filterMap(decoded, R.toOption),
      }),
    ),
  );
}

/** Reads a backup file. Anything short of a complete, valid file is refused. */
export function parseProfileBackup(
  text: string,
): R.Result<ProfileBackup, ProfileBackupError> {
  return pipe(
    R.fromExecution(() => JSON.parse(text) as unknown),
    R.mapError((): ProfileBackupError => "syntax"),
    R.flatMap(checkClaim),
    R.flatMap((data) => {
      const parsed = profileBackupSchema.safeParse(data);
      if (!parsed.success) {
        return R.makeError<ProfileBackup, ProfileBackupError>("invalid");
      }
      return decodeFile(parsed.data);
    }),
  );
}
