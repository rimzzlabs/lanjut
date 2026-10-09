import type { ResumeLanguage } from "@lanjut/resume";
import { importParsedResume } from "@lanjut/resume/interchange/import-file";
import {
  detectInterchangeFormat,
  parseInterchangeText,
} from "@lanjut/resume/interchange/paste";
import { CodeTextarea } from "@lanjut/ui/components/code-textarea";
import { S } from "@mobily/ts-belt";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { useEditorImport } from "../use-editor-import";
import { EditorPasteActions } from "./editor-paste-actions";
import { EditorPasteStatus } from "./editor-paste-status";
import { highlightInterchange } from "./highlight-interchange";
import { PASTE_BOX_HEIGHT } from "./paste-box";

function checkText(text: string) {
  if (S.isEmpty(S.trim(text))) return undefined;
  return parseInterchangeText(text, detectInterchangeFormat(text));
}

/**
 * The paste dialog's body: a box for the JSON or YAML that Lanjut copied,
 * colored by its format, with a live check and the import actions. It loads
 * with the dialog, so the parsers stay out of the editor's first load.
 */
export function EditorPasteForm(props: { onDone: () => void }) {
  const t = useTranslations("editor.paste");
  const locale = useLocale();
  const templateId = useResumeStore((state) => state.open?.templateId);
  const importer = useEditorImport();
  const statusId = useId();
  const [text, setText] = useState("");
  // The colors follow every keystroke, or the mirror would show old text.
  // The check can trail behind a long paste.
  const checkedText = useDeferredValue(text);
  const format = detectInterchangeFormat(text);
  const highlighted = useMemo(
    () => highlightInterchange(text, format),
    [text, format],
  );
  const checked = useMemo(() => checkText(checkedText), [checkedText]);

  // The check above can trail the text, so an import reads the text afresh.
  const readImport = () => {
    const parsed = checkText(text);
    if (parsed === undefined) return undefined;
    const imported = importParsedResume(parsed, {
      title: t("pastedTitle"),
      language: locale as ResumeLanguage,
      templateId: templateId ?? "awal",
    });
    return imported.ok ? imported : undefined;
  };

  const onReplace = () => {
    const imported = readImport();
    if (!imported) return;
    importer.replace(imported);
    toast.success(t("imported"));
    props.onDone();
  };

  const onCreate = async () => {
    const imported = readImport();
    if (!imported) return;
    props.onDone();
    await importer.createFromImport(imported, imported.resume.title);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <CodeTextarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        highlighted={highlighted}
        placeholder={t("placeholder")}
        aria-label={t("label")}
        aria-describedby={statusId}
        aria-invalid={checked?.ok === false}
        className={PASTE_BOX_HEIGHT}
      />
      <EditorPasteStatus
        id={statusId}
        format={detectInterchangeFormat(checkedText)}
        parsed={checked}
      />
      <EditorPasteActions
        isBlank={importer.isBlank}
        ready={checked?.ok === true}
        onReplace={onReplace}
        onCreate={() => void onCreate()}
      />
    </div>
  );
}
