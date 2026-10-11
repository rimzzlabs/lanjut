import type { Resume } from "@lanjut/resume";
import {
  applyCodeText,
  type CodeEdit,
} from "@lanjut/resume/interchange/code-edit";
import {
  type CodeDraft,
  isCodeModeOn,
  liveDraft,
  useDeveloperModeStore,
  useEditorCodeStore,
  useResumeStore,
} from "@/lib/store";

type Pending = Pick<CodeDraft, "text" | "format">;

function isLatest(pending: Pending, resume: Resume): boolean {
  const draft = useEditorCodeStore.getState().draft;
  if (draft?.text !== pending.text || draft.format !== pending.format) {
    return false;
  }
  return isCodeModeOn() && useResumeStore.getState().open === resume;
}

/**
 * A read can come back after a newer keystroke, another write to the résumé,
 * or the return to the forms. Only the read of the latest text is applied.
 */
function commit(pending: Pending, resume: Resume, edit: CodeEdit) {
  if (!isLatest(pending, resume)) return;
  if (edit.resume !== resume) {
    useResumeStore.getState().updateOpen(() => edit.resume);
  }
  useEditorCodeStore.getState().setDraft({
    ...pending,
    resume: useResumeStore.getState().open ?? resume,
    parsed: edit.parsed,
    ignored: edit.ignored,
  });
}

/**
 * Takes a keystroke in the code. The text shows at once, with the result of
 * the last read, and the new read follows: Markdown is read asynchronously.
 */
export function editCode(text: string) {
  const resume = useResumeStore.getState().open;
  if (!resume) return;
  const format = useDeveloperModeStore.getState().format;
  const code = useEditorCodeStore.getState();
  const previous = liveDraft({ draft: code.draft, open: resume, format });
  code.setDraft({
    text,
    format,
    resume,
    parsed: previous?.parsed ?? null,
    ignored: previous?.ignored ?? 0,
  });
  void applyCodeText({ resume, text, format }).then((edit) =>
    commit({ text, format }, resume, edit),
  );
}
