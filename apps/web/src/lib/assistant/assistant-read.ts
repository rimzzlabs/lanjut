import type { Resume } from "@lanjut/resume";
import { getResume, revisionOf } from "@lanjut/resume/db";
import {
  type CodeFormat,
  resumeToCodeText,
} from "@lanjut/resume/interchange/code-edit";
import { O, R } from "@mobily/ts-belt";
import { flushOpenResumePersist } from "@/lib/store/persistence";
import { useResumeStore } from "@/lib/store/resume-store";
import { findResume } from "./assistant-library";
import { editedHere, UNREADABLE_RESUME } from "./assistant-window";

/** What `lanjut_get_resume` gives. The text never holds the photo. */
interface ResumeText {
  id: string;
  title: string;
  revision: number;
  format: CodeFormat;
  text: string;
}

interface Copy {
  resume: Resume;
  revision: number;
}

/**
 * The copy that the person sees. The résumé that this window edits can hold
 * edits that wait for their save, so those land first and the revision counts
 * them.
 */
async function readCopy(id: string): Promise<O.Option<Copy>> {
  if (O.isSome(editedHere(id))) {
    await flushOpenResumePersist();
    const state = useResumeStore.getState();
    if (state.open?.id === id) {
      return O.Some({ resume: state.open, revision: state.openRevision });
    }
  }
  const stored = await getResume(id).catch(() => undefined);
  if (!stored) return O.None;
  return O.Some({ resume: stored, revision: revisionOf(stored) });
}

interface GetResumeParams {
  id: string;
  format: CodeFormat;
}

export async function getResumeText(
  params: GetResumeParams,
): Promise<R.Result<ResumeText, string>> {
  const found = await findResume(params.id);
  if (R.isError(found)) return found;
  const copy = await readCopy(params.id);
  if (O.isNone(copy)) return R.makeError(UNREADABLE_RESUME);
  return R.makeOk({
    id: params.id,
    title: copy.resume.title,
    revision: copy.revision,
    format: params.format,
    text: resumeToCodeText(copy.resume, params.format),
  });
}
