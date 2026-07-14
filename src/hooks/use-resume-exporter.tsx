"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import type { ExportFormat } from "@/components/editor/export-format";
import type { ResumeExportRequest } from "@/components/editor/resume-exporter";
import type { Resume } from "@/lib/resume";

const ResumeExporter = dynamic(
  () =>
    import("@/components/editor/resume-exporter").then((m) => m.ResumeExporter),
  { ssr: false },
);

export function useResumeExporter() {
  const [request, setRequest] = useState<ResumeExportRequest | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const runExport = useCallback(
    (resume: Resume, format: ExportFormat, fileName: string) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setRequest({ resume, format, fileName });
      }),
    [],
  );

  const handleSettled = useCallback((ok: boolean) => {
    setRequest(null);
    resolverRef.current?.(ok);
    resolverRef.current = null;
  }, []);

  const exporter = request ? (
    <ResumeExporter request={request} onSettled={handleSettled} />
  ) : null;

  return { runExport, exporting: request !== null, exporter };
}
