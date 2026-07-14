"use client";

import { useCallback } from "react";
import type { ExportFormat } from "@/components/editor/export-format";
import { useResumeStore } from "@/lib/store";
import { useResumeExporter } from "./use-resume-exporter";

export function useResumeDownload() {
  const resume = useResumeStore((state) => state.open);
  const { runExport, exporting, exporter } = useResumeExporter();

  const download = useCallback(
    (format: ExportFormat, fileName: string) => {
      if (!resume) return Promise.resolve(false);
      return runExport(resume, format, fileName);
    },
    [resume, runExport],
  );

  return { resume, generating: exporting, download, exporter };
}
