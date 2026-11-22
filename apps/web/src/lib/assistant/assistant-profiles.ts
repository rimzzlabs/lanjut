import {
  createEmptyResume,
  createProfile,
  GUEST_PROFILE_ID,
  type Profile,
  resolveResumeProfileId,
} from "@lanjut/resume";
import { revisionOf } from "@lanjut/resume/db";
import {
  resumeToInterchange,
  validateInterchange,
} from "@lanjut/resume/interchange";
import { A, D, O, pipe, R } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import type { z } from "zod";
import { isEditFrozen } from "@/lib/edit-lock";
import { PROFILE_PATHNAME } from "@/lib/routes";
import { hasInvalidDraft } from "@/lib/store/editor-code-store";
import { useProfileStore } from "@/lib/store/profile-store";
import { useResumeStore } from "@/lib/store/resume-store";
import type { profileIdArgs, saveProfileArgs } from "./assistant-args";
import { failureMessage } from "./assistant-issues";
import type { AssistantWindow } from "./assistant-window";
import { DRAFT_ERROR } from "./assistant-window";

type ToolResult = R.Result<unknown, string>;

const UNREADABLE = "Lanjut could not read its storage. Restart Lanjut.";

async function readyProfiles(): Promise<boolean> {
  const profiles = useProfileStore.getState();
  const resumes = useResumeStore.getState();
  await Promise.all([
    profiles.status === "ready" ? undefined : profiles.hydrate(),
    resumes.indexStatus === "ready" ? undefined : resumes.hydrateIndex(),
  ]);
  return useProfileStore.getState().status === "ready";
}

/** The profile as a résumé that holds only its header and its summary. */
function profileAsResume(profile: Profile) {
  const base = createEmptyResume(profile.name);
  return {
    ...base,
    header: D.deleteKey(profile.header, "photo"),
    sections: A.filterMap(base.sections, (section) => {
      if (section.type !== "summary") return O.None;
      return O.Some({
        ...section,
        entries: [
          {
            id: section.id,
            fields: {
              body: { kind: "richtext" as const, value: profile.summary },
            },
          },
        ],
      });
    }),
  };
}

async function profileMarkdown(profile: Profile): Promise<string> {
  const { interchangeToMarkdown } = await import(
    "@lanjut/resume/interchange/resume-md-write"
  );
  return interchangeToMarkdown(resumeToInterchange(profileAsResume(profile)));
}

function resumeCount(id: string): number {
  const profiles = useProfileStore.getState().profiles;
  return A.length(
    A.filter(
      useResumeStore.getState().index,
      (entry) => resolveResumeProfileId(entry.profileId, profiles) === id,
    ),
  );
}

export async function listProfiles(): Promise<ToolResult> {
  if (!(await readyProfiles())) return R.makeError(UNREADABLE);
  const state = useProfileStore.getState();
  const profiles = await Promise.all(
    A.map(state.profiles, async (profile) => ({
      id: profile.id,
      name: profile.name,
      active: profile.id === state.activeId,
      resumes: resumeCount(profile.id),
      revision: revisionOf(profile),
      markdown: await profileMarkdown(profile),
    })),
  );
  return R.makeOk({ profiles });
}

function findProfile(id: string): R.Result<Profile, string> {
  return pipe(
    A.find(useProfileStore.getState().profiles, (profile) => profile.id === id),
    O.toResult(
      `Lanjut has no profile with the id ${id}. Call lanjut_list_profiles for the ids.`,
    ),
  );
}

export async function switchProfile(
  args: z.infer<typeof profileIdArgs>,
): Promise<ToolResult> {
  if (!(await readyProfiles())) return R.makeError(UNREADABLE);
  const found = findProfile(args.id);
  if (R.isError(found)) return found;
  const profile = R.getExn(found);
  await useProfileStore.getState().setActive(profile.id);
  return R.makeOk({
    id: profile.id,
    name: profile.name,
    resumes: resumeCount(profile.id),
  });
}

interface ProfileText {
  header: Profile["header"];
  summary: JSONContent;
}

/** The header and the summary that a profile's Markdown holds. */
async function readProfileMarkdown(
  markdown: string,
  profile: Profile,
): Promise<R.Result<ProfileText, string>> {
  const { markdownToInterchange } = await import(
    "@lanjut/resume/interchange/resume-md-read"
  );
  const base = resumeToInterchange(profileAsResume(profile));
  const read = await markdownToInterchange(markdown, base);
  const parsed = validateInterchange(read.doc);
  if (!parsed.ok) return R.makeError(failureMessage(markdown, parsed));
  const summary = pipe(
    A.find(parsed.content.sections, (section) => section.type === "summary"),
    O.flatMap((section) => A.head(section.entries)),
    O.flatMap((entry) => O.fromNullable(entry.fields.body)),
    O.flatMap((field) =>
      field.kind === "richtext" ? O.Some(field.value) : O.None,
    ),
    O.getWithDefault(profile.summary),
  );
  // The read fills in every core section, so only one with entries is extra.
  const extra = A.filter(
    parsed.content.sections,
    (section) => section.type !== "summary" && !A.isEmpty(section.entries),
  );
  if (!A.isEmpty(extra)) {
    return R.makeError(
      "A profile holds only the header and the summary. Leave out the other `##` sections.",
    );
  }
  return R.makeOk({
    header: { ...parsed.content.header, photo: profile.header.photo },
    summary,
  });
}

/** A move away from the editor would drop a code text with an error. */
async function showProfile(
  id: string,
  win: AssistantWindow,
): Promise<R.Result<true, string>> {
  if (hasInvalidDraft()) return R.makeError(DRAFT_ERROR);
  await win.go(`${PROFILE_PATHNAME}?profile=${encodeURIComponent(id)}`);
  return R.makeOk(true);
}

type SaveArgs = z.infer<typeof saveProfileArgs>;

async function createNewProfile(
  args: SaveArgs,
  win: AssistantWindow,
): Promise<ToolResult> {
  if (!args.name) {
    return R.makeError("Give a `name` to create a profile.");
  }
  const empty = createProfile(args.name);
  const text = args.markdown
    ? await readProfileMarkdown(args.markdown, empty)
    : R.makeOk<ProfileText, string>({
        header: empty.header,
        summary: empty.summary,
      });
  if (R.isError(text)) return text;
  const profile = { ...empty, ...R.getExn(text) };
  await useProfileStore.getState().addProfile(profile);
  const shown = await showProfile(profile.id, win);
  if (R.isError(shown)) return shown;
  return R.makeOk({
    id: profile.id,
    name: profile.name,
    active: true,
    revision: revisionOf(findOrSelf(profile)),
  });
}

function findOrSelf(profile: Profile): Profile {
  return R.getWithDefault(findProfile(profile.id), profile);
}

async function updateProfile(
  args: SaveArgs & { id: string },
  win: AssistantWindow,
): Promise<ToolResult> {
  const found = findProfile(args.id);
  if (R.isError(found)) return found;
  const profile = R.getExn(found);
  if (args.base_revision === undefined) {
    return R.makeError(
      "Give the `base_revision` that lanjut_list_profiles gave for this profile.",
    );
  }
  if (revisionOf(profile) !== args.base_revision) {
    return R.makeError(
      `The profile changed after base_revision: it is at revision ${revisionOf(profile)} now. Call lanjut_list_profiles again.`,
    );
  }
  if (isEditFrozen("profile", profile.id)) {
    return R.makeError(
      "Another Lanjut window edits this profile. Ask the person to press Edit here, then try again.",
    );
  }
  const text = args.markdown
    ? await readProfileMarkdown(args.markdown, profile)
    : R.makeOk<ProfileText, string>({
        header: profile.header,
        summary: profile.summary,
      });
  if (R.isError(text)) return text;
  const name = args.name ?? profile.name;
  if (profile.id === GUEST_PROFILE_ID && !name) {
    return R.makeError("Give a `name` to save this profile.");
  }
  const shown = await showProfile(profile.id, win);
  if (R.isError(shown)) return shown;
  const saved = await useProfileStore
    .getState()
    .saveProfile({ ...profile, ...R.getExn(text), name });
  if (!saved) {
    return R.makeError(
      "Another Lanjut window saved this profile first. Lanjut asks the person which version to keep. Read it again after that.",
    );
  }
  const written = findOrSelf(profile);
  return R.makeOk({
    id: written.id,
    name: written.name,
    revision: revisionOf(written),
  });
}

export async function saveProfile(
  args: SaveArgs,
  win: AssistantWindow,
): Promise<ToolResult> {
  if (!(await readyProfiles())) return R.makeError(UNREADABLE);
  if (args.id === undefined) return createNewProfile(args, win);
  return updateProfile({ ...args, id: args.id }, win);
}

/** Moves a résumé of the active profile into another profile. */
export async function moveResumeToProfile(
  resumeId: string,
  profileId: string,
): Promise<R.Result<true, string>> {
  const found = findProfile(profileId);
  if (R.isError(found)) return found;
  await useResumeStore.getState().moveToProfile([resumeId], profileId);
  return R.makeOk(true);
}
