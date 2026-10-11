import { resumeToCodeText } from "@lanjut/resume/interchange/code-edit";
import { CodeTextarea } from "@lanjut/ui/components/code-textarea";
import { useTranslations } from "use-intl";
import { useCodeDraft } from "@/hooks/use-editor-mode";
import { useDeveloperModeStore, useResumeStore } from "@/lib/store";
import { CODE_FORMAT_NAMES } from "./code-formats";
import { editCode } from "./edit-code";
import {
  EDITOR_CODE_KEYS_ID,
  EDITOR_CODE_STATUS_ID,
} from "./editor-code-footer";
import { highlightCode } from "./highlight-code";
import { useCodeKeys } from "./use-code-keys";

export function EditorCodeInput() {
  const t = useTranslations("editor.code");
  const open = useResumeStore((state) => state.open);
  const format = useDeveloperModeStore((state) => state.format);
  const draft = useCodeDraft();
  const onKeyDown = useCodeKeys();

  if (!open) return null;
  const text = draft ? draft.text : resumeToCodeText(open, format);

  return (
    <CodeTextarea
      value={text}
      onChange={(event) => editCode(event.target.value)}
      onKeyDown={onKeyDown}
      highlighted={highlightCode(text, format)}
      aria-label={t("label", { format: CODE_FORMAT_NAMES[format] })}
      aria-describedby={`${EDITOR_CODE_STATUS_ID} ${EDITOR_CODE_KEYS_ID}`}
      aria-invalid={draft?.parsed?.ok === false}
      className="h-full min-h-0 rounded-none border-0 shadow-none focus-within:ring-0 has-aria-invalid:ring-0 dark:bg-transparent"
      layerClassName="px-4 md:px-6"
    />
  );
}
