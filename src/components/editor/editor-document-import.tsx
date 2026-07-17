"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { PlatformResumeImportDropzone } from "@/components/platform/platform-resume-import-dropzone";
import { ResumeImportDisclaimer } from "@/components/shared/resume-import-disclaimer";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { ParseResult } from "@/lib/import";
import type { ResumeLanguage } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { isResumePreviewEmpty, resumeToPreview } from "./resume-to-preview";

/** Strip an imported file's name down to a résumé title. */
function titleFromFileName(name: string): string {
  return name.replace(/\.(pdf|json|ya?ml)$/i, "").trim() || name;
}

interface Pending {
  file: File;
  result: ParseResult;
}

/**
 * Import a PDF or JSON export into the editor. When the open document already has content the
 * user chooses to replace it in place or create a separate new résumé; a blank
 * document is filled directly without asking.
 */
export function EditorDocumentImport() {
  const open = useResumeStore((state) => state.open);
  const replaceOpenWithImport = useResumeStore(
    (state) => state.replaceOpenWithImport,
  );
  const createResume = useResumeStore((state) => state.createResume);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("editor.document");
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);

  if (!open) return null;

  const isBlank = isResumePreviewEmpty(resumeToPreview(open));

  const reset = () => {
    setPending(null);
    setDropzoneKey((key) => key + 1);
  };

  const onParsed = (file: File, result: ParseResult) => {
    // A blank document has nothing to lose, so fill it in place without asking.
    if (isBlank) {
      replaceOpenWithImport(result);
      reset();
    } else {
      setPending({ file, result });
    }
  };

  const replace = () => {
    if (!pending) return;
    replaceOpenWithImport(pending.result);
    reset();
  };

  const createNew = async () => {
    if (!pending) return;
    const resume = await createResume(titleFromFileName(pending.file.name), {
      source: "import",
      imported: pending.result,
      templateId: open.templateId,
      language: locale as ResumeLanguage,
    });
    reset();
    router.push(`/platform/editor/${resume.id}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <ResumeImportDisclaimer />
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
