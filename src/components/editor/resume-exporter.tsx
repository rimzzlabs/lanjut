"use client";

import { useEffect, useRef } from "react";
import type { Resume } from "@/lib/resume";
import { downloadResume } from "./download-resume";
import type { ExportFormat } from "./export-format";

export interface ResumeExportRequest {
  resume: Resume;
  format: ExportFormat;
  fileName: string;
}

interface ResumeExporterProps {
  request: ResumeExportRequest;
  onSettled: (ok: boolean) => void;
}

export function ResumeExporter({ request, onSettled }: ResumeExporterProps) {
  // The download hands a file to the browser and cannot be undone, so it must
  // fire once per request even though the effect re-runs (StrictMode). Guard on
  // the request identity rather than cleanup, which cannot cancel the download.
  const startedFor = useRef<ResumeExportRequest | null>(null);

  // Driving the browser download is a side effect against an external system,
  // so it lives in an effect. Loaded only through a ssr:false boundary to keep
  // the PDF/DOCX libraries out of the server bundle.
  useEffect(() => {
    if (startedFor.current === request) return;
    startedFor.current = request;
    downloadResume(request.resume, request.format, request.fileName)
      .then(() => onSettled(true))
      .catch(() => onSettled(false));
  }, [request, onSettled]);

  return null;
}
