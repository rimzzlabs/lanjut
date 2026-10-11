import type { Profile, Resume } from "@lanjut/resume";
import {
  deleteProfile,
  deleteResume,
  type ExpectedRevision,
  putProfile,
  putResume,
} from "@lanjut/resume/db";
import { R } from "@mobily/ts-belt";
import { postWindowMessage } from "../window-channel";

// Each write tells the other windows of this browser which item changed, so
// their lists follow. The message carries the id, never the content.

export async function putResumeAnnounced(
  resume: Resume,
  expected: ExpectedRevision,
) {
  const saved = await putResume(resume, expected);
  if (R.isOk(saved)) {
    postWindowMessage({ type: "saved", kind: "resume", id: resume.id });
  }
  return saved;
}

export async function deleteResumeAnnounced(id: string): Promise<void> {
  await deleteResume(id);
  postWindowMessage({ type: "deleted", kind: "resume", id });
}

export async function putProfileAnnounced(
  profile: Profile,
  expected: ExpectedRevision,
) {
  const saved = await putProfile(profile, expected);
  if (R.isOk(saved)) {
    postWindowMessage({ type: "saved", kind: "profile", id: profile.id });
  }
  return saved;
}

export async function deleteProfileAnnounced(id: string): Promise<void> {
  await deleteProfile(id);
  postWindowMessage({ type: "deleted", kind: "profile", id });
}
