import type { ParseResult } from "@lanjut/resume/import";
import { Button } from "@lanjut/ui/components/button";
import { pipe, S } from "@mobily/ts-belt";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { PlatformResumeImportDropzone } from "@/components/platform/platform-resume-import-dropzone";
import { useResumeStore } from "@/lib/store";
import { useEditorImport } from "./use-editor-import";

/** Strip an imported file's name down to a résumé title. */
function titleFromFileName(name: string): string {
  return pipe(name, S.replaceByRe(/\.(pdf|json|ya?ml)$/i, ""), S.trim) || name;
}

interface Pending {
  file: File;
  result: ParseResult;
}

/**
 * Import a PDF, JSON, or YAML file into the editor. When the open document
 * already has content the user chooses to replace it in place or create a
 * separate new résumé; a blank document is filled directly without asking.
 */
export function EditorDocumentImport() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  const { isBlank, replace: replaceOpen, createFromImport } = useEditorImport();
  const t = useTranslations("editor.document");
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);

  if (!hasOpen) return null;

  const reset = () => {
    setPending(null);
    setDropzoneKey((key) => key + 1);
  };

  const onParsed = (file: File, result: ParseResult) => {
    // A blank document has nothing to lose, so fill it in place without asking.
    if (isBlank) {
      replaceOpen(result);
      reset();
    } else {
      setPending({ file, result });
    }
  };

  const replace = () => {
    if (!pending) return;
    replaceOpen(pending.result);
    reset();
  };

  const createNew = async () => {
    if (!pending) return;
    await createFromImport(
      pending.result,
      titleFromFileName(pending.file.name),
    );
    reset();
  };

  return (
    <div className="flex flex-col gap-3">
      <PlatformResumeImportDropzone
        key={dropzoneKey}
        onParsingChange={() => {}}
        onParsed={onParsed}
        onCleared={() => setPending(null)}
      />

      {pending && (
        <div className="flex flex-col gap-2 rounded-xl border p-3">
          <p className="text-sm text-balance">{t("replacePrompt")}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={replace}
            >
              {t("replace")}
            </Button>
            <Button type="button" className="flex-1" onClick={createNew}>
              {t("createNew")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
