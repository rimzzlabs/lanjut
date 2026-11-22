import type { Resume } from "@lanjut/resume";
import {
  applyCodeText,
  resumeToCodeText,
} from "@lanjut/resume/interchange/code-edit";
import { D, O, R } from "@mobily/ts-belt";
import { hasInvalidDraft } from "@/lib/store/editor-code-store";
import { flushOpenResumePersist } from "@/lib/store/persistence";
import { useResumeStore } from "@/lib/store/resume-store";
import {
  type SaveStatus,
  useSaveStatusStore,
} from "@/lib/store/save-status-store";
import { failureMessage, ignoredMessage } from "./assistant-issues";
import { findResume } from "./assistant-library";
import {
  type AssistantWindow,
  DRAFT_ERROR,
  editedHere,
  showResume,
} from "./assistant-window";
import { applyTextEdits, type TextEdit } from "./text-edits";

/** What a write gives the model: the revision for its next write. */
interface WriteResult {
  id: string;
  title: string;
  revision: number;
  changed: boolean;
}

/** Only a refresh or the person's choice ends these, so a write waits for them. */
const BLOCKED: Partial<Record<SaveStatus, string>> = {
  outdated:
    "A newer version of Lanjut saved this résumé, so this version must not write it. Ask the person to update Lanjut.",
  changed:
    "This résumé changed in another Lanjut window. Lanjut asks the person which version to keep. Read the résumé again after that.",
  deleted: "This résumé was deleted in another Lanjut window.",
};

const UNSAVED: Partial<Record<SaveStatus, string>> = {
  ...BLOCKED,
  failed: "Lanjut could not save it. Try again.",
};

/** The save status after the pending save of the open résumé lands. */
async function savedStatus(): Promise<SaveStatus> {
  await flushOpenResumePersist();
  return useSaveStatusStore.getState().status;
}

function staleMessage(revision: number): string {
  return `The résumé changed after base_revision: it is at revision ${revision} now. Call lanjut_get_resume again, then write against the new text.`;
}

interface WriteParams {
  id: string;
  baseRevision: number;
  /** The new Markdown, from the Markdown of the résumé as it is. */
  nextText: (current: string) => R.Result<string, string>;
}

/** Still the same résumé object, edited here, with no code text in the way. */
function unchangedSince(resume: Resume): boolean {
  return (
    O.mapWithDefault(editedHere(resume.id), false, (open) => open === resume) &&
    !hasInvalidDraft()
  );
}

/**
 * Writes the résumé through the code mode's reader, as one undo step. It
 * opens in the editor first, so the person sees the change and can undo it.
 */
async function writeResume(
  params: WriteParams,
  win: AssistantWindow,
): Promise<R.Result<WriteResult, string>> {
  const found = await findResume(params.id);
  if (R.isError(found)) return found;
  if (hasInvalidDraft()) return R.makeError(DRAFT_ERROR);
  const shown = await showResume(params.id, win);
  if (R.isError(shown)) return shown;

  const blocked = D.get(BLOCKED, await savedStatus());
  if (O.isSome(blocked)) return R.makeError(blocked);
  const before = useResumeStore.getState();
  if (!before.open || before.open.id !== params.id) {
    return R.makeError("Lanjut closed the résumé. Try again.");
  }
  if (before.openRevision !== params.baseRevision) {
    return R.makeError(staleMessage(before.openRevision));
  }

  const resume = before.open;
  return R.match(
    params.nextText(resumeToCodeText(resume, "markdown")),
    (text) => applyText({ resume, revision: before.openRevision, text }, win),
    (message) => Promise.resolve(R.makeError<WriteResult, string>(message)),
  );
}

interface ApplyTextParams {
  /** The open résumé that the text was made from. */
  resume: Resume;
  revision: number;
  text: string;
}

const READER_ERROR =
  "Lanjut could not load its Markdown reader, so it did not read the text. The text can be fine: do not change it. Ask the person to restart Lanjut, then try again.";

/**
 * `applyCodeText` reads a reader that fails to load as an error in the text,
 * which would send the model to repair text that has none. The reader is the
 * same module, so a load here tells the two apart.
 */
function markdownReaderLoads(): Promise<boolean> {
  return import("@lanjut/resume/interchange/resume-md-read").then(
    () => true,
    () => false,
  );
}

async function applyText(
  params: ApplyTextParams,
  win: AssistantWindow,
): Promise<R.Result<WriteResult, string>> {
  const { resume, revision, text } = params;
  if (!(await markdownReaderLoads())) return R.makeError(READER_ERROR);
  const edit = await applyCodeText({ resume, text, format: "markdown" });
  if (!edit.parsed.ok) return R.makeError(failureMessage(text, edit.parsed));
  if (edit.ignored > 0) return R.makeError(ignoredMessage(edit.ignored));
  // The person can type while the text is read.
  if (!unchangedSince(resume)) {
    return R.makeError(staleMessage(useResumeStore.getState().openRevision));
  }
  if (edit.resume === resume) {
    return R.makeOk({
      id: resume.id,
      title: resume.title,
      revision,
      changed: false,
    });
  }

  useResumeStore.getState().updateOpenAsStep(() => edit.resume);
  const unsaved = D.get(UNSAVED, await savedStatus());
  if (O.isSome(unsaved)) {
    return R.makeError(
      `Lanjut shows the change, but did not save it. ${unsaved}`,
    );
  }
  const after = useResumeStore.getState();
  const written = after.open ?? edit.resume;
  win.changed(resume, written);
  return R.makeOk({
    id: written.id,
    title: written.title,
    revision: after.openRevision,
    changed: true,
  });
}

interface EditParams {
  id: string;
  baseRevision: number;
  edits: ReadonlyArray<TextEdit>;
}

export function editResume(
  params: EditParams,
  win: AssistantWindow,
): Promise<R.Result<WriteResult, string>> {
  return writeResume(
    {
      id: params.id,
      baseRevision: params.baseRevision,
      nextText: (current) => applyTextEdits(current, params.edits),
    },
    win,
  );
}

interface ReplaceParams {
  id: string;
  baseRevision: number;
  markdown: string;
}

export function replaceResume(
  params: ReplaceParams,
  win: AssistantWindow,
): Promise<R.Result<WriteResult, string>> {
  return writeResume(
    {
      id: params.id,
      baseRevision: params.baseRevision,
      nextText: () => R.makeOk(params.markdown),
    },
    win,
  );
}
