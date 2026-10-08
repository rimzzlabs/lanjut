import { A, D, O, pipe, S } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import { createEmptyHeader, emptyRichTextValue } from "./factory";
import { isRichEmpty, tiptapToRichBlocks } from "./rich-content";
import type { Header, Resume } from "./types";
import { updateSectionOfType, updateSections } from "./update";

/**
 * Personal information and a summary, kept apart from every résumé. The
 * active profile fills the header and the summary of each new résumé, so a
 * person can keep one profile per kind of job or job market. Profiles live in
 * their own IndexedDB store and never leave the browser. The header has the
 * résumé header's shape (`HEADER_SCHEMA`), so it copies across as it is.
 */
export interface Profile {
  id: string;
  /** What the person calls this profile. Empty only on the unsaved guest. */
  name: string;
  header: Header;
  summary: JSONContent;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601. */
  updatedAt: string;
}

/**
 * The profile that stands in before the person saves one. It lives in memory
 * until its first save.
 */
export const GUEST_PROFILE_ID = "guest";

export function createProfile(name: string, id: string = nanoid()): Profile {
  const now = new Date().toISOString();
  return {
    id,
    name,
    header: createEmptyHeader(),
    summary: emptyRichTextValue(),
    createdAt: now,
    updatedAt: now,
  };
}

export function createGuestProfile(): Profile {
  return createProfile("", GUEST_PROFILE_ID);
}

function headerHasContent(header: Header): boolean {
  if (header.photo) return true;
  return pipe(
    D.values(header.fields),
    A.some(
      (field) => field.kind === "plain" && S.isNotEmpty(S.trim(field.value)),
    ),
  );
}

/** True when the profile holds no personal information and no summary. */
export function isProfileEmpty(profile: Profile): boolean {
  return (
    !headerHasContent(profile.header) &&
    isRichEmpty(tiptapToRichBlocks(profile.summary))
  );
}

/**
 * The profile a résumé belongs to. A résumé with no profile, or with one that
 * no longer exists, belongs to the first profile.
 */
export function resolveResumeProfileId(
  profileId: string | undefined,
  profiles: ReadonlyArray<Profile>,
): string {
  const home = pipe(
    profiles,
    A.head,
    O.mapWithDefault(GUEST_PROFILE_ID, (profile) => profile.id),
  );
  if (profileId === undefined) return home;
  if (A.some(profiles, (profile) => profile.id === profileId)) return profileId;
  return home;
}

/** The person's full name on the profile, or an empty string. */
export function profilePersonName(profile: Profile): string {
  const fields = profile.header.fields;
  return pipe(
    [fields.firstName, fields.lastName],
    A.filterMap((field) => {
      if (field?.kind !== "plain") return O.None;
      const value = S.trim(field.value);
      if (S.isEmpty(value)) return O.None;
      return O.Some(value);
    }),
    A.join(" "),
  );
}

/**
 * A new résumé with its header and summary taken from the profile. An empty
 * profile changes nothing, so the sample keeps its own header.
 */
export function applyProfile(resume: Resume, profile: Profile): Resume {
  if (isProfileEmpty(profile)) return resume;
  const withHeader: Resume = {
    ...resume,
    header: structuredClone(profile.header),
  };
  return updateSections(
    withHeader,
    updateSectionOfType("summary", (section) => ({
      ...section,
      entries: [
        {
          id: nanoid(),
          fields: {
            body: { kind: "richtext", value: structuredClone(profile.summary) },
          },
        },
      ],
    })),
  );
}
