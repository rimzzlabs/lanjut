"use client";

import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import type { ParseResult } from "@/lib/import";
import { runPdfImport } from "@/lib/import/run-import";
import type { ResumeLanguage } from "@/lib/resume";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const MAX_BYTES = 10 * 1024 * 1024;

type ErrorKey =
  | "errorNotPdf"
  | "errorTooLarge"
  | "errorEmpty"
  | "errorEncrypted"
  | "errorGeneric";

interface PlatformResumeImportDropzoneProps {
  onParsingChange: (parsing: boolean) => void;
  /** A successful parse: the source file and its parsed document + leftovers. */
  onParsed: (file: File, result: ParseResult) => void;
  /** The current selection was cleared or failed to parse. */
  onCleared: () => void;
}

export function PlatformResumeImportDropzone(
  props: PlatformResumeImportDropzoneProps,
) {
  const t = useTranslations("forms.import");
  const locale = useLocale();
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  const { onParsingChange, onParsed, onCleared } = props;

  const reset = useCallback(() => {
    setFileName(null);
    setParsing(false);
    onCleared();
  }, [onCleared]);

  const onDrop = useCallback(
    async (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const tooLarge = rejections[0].errors.some(
          (e) => e.code === "file-too-large",
        );
        setError(tooLarge ? "errorTooLarge" : "errorNotPdf");
        reset();
        return;
      }
      const file = accepted[0];
      if (!file) return;

      setError(null);
      setFileName(file.name);
      setParsing(true);
      onParsingChange(true);

      const buffer = await file.arrayBuffer();
      const result = await runPdfImport(buffer, {
        title: file.name,
        language: locale as ResumeLanguage,
        templateId: "awal",
      });

      setParsing(false);
      onParsingChange(false);
      if (result.ok) {
        onParsed(file, result);
        return;
      }
      setError(
        result.reason === "empty"
          ? "errorEmpty"
          : result.reason === "encrypted"
            ? "errorEncrypted"
            : "errorGeneric",
      );
      setFileName(null);
      onCleared();
    },
    [locale, onParsed, onParsingChange, onCleared, reset],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_BYTES,
    multiple: false,
    disabled: parsing,
  });

  if (fileName && !error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
        {parsing ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <FileText className="size-5 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            {parsing ? t("parsing") : t("parsed")}
          </p>
        </div>
        {!parsing && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={reset}>
            <X /> <span className="sr-only">{t("remove")}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors hover:bg-muted/40",
          isDragActive && "border-primary bg-muted/40",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">{t("dropPrompt")}</p>
        <p className="text-xs text-muted-foreground text-balance">
          {t("hint")}
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{t(error)}</p>}
    </div>
  );
}
