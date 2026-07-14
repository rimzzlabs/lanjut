"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ExportFormat } from "@/components/editor/export-format";
import { useResumeExporter } from "@/hooks/use-resume-exporter";
import { getResume } from "@/lib/db";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../shared/responsive-dialog";
import { PlatformResumeDownloadForm } from "./platform-resume-download-form";

interface PlatformResumeActionDownloadProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionDownload(
  props: PlatformResumeActionDownloadProps,
) {
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);
  const t = useTranslations("forms.download");
  const { runExport, exporting, exporter } = useResumeExporter();

  async function handleDownload(format: ExportFormat, fileName: string) {
    setLoading(true);
    try {
      const document = await getResume(props.resume.id).catch(() => undefined);
      if (!document) {
        setMissing(true);
        return;
      }
      const ok = await runExport(document, format, fileName);
      if (ok) props.onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {t("title", { title: props.resume.title })}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {missing ? (
          <p className="text-sm text-destructive">{t("missing")}</p>
        ) : (
          <PlatformResumeDownloadForm
            key={props.resume.title}
            defaultFileName={props.resume.title}
            generating={loading || exporting}
            onSubmit={(format, fileName) =>
              void handleDownload(format, fileName)
            }
          />
        )}
        {exporter}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
