import { lazy, Suspense, useCallback, useRef, useState } from "react";
import type { ResumeExportRequest } from "@/components/editor/resume-exporter";

const ResumeExporter = lazy(() =>
  import("@/components/editor/resume-exporter").then((m) => ({
    default: m.ResumeExporter,
  })),
);

export function useResumeExporter() {
  const [request, setRequest] = useState<ResumeExportRequest | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const runExport = useCallback(
    (next: ResumeExportRequest) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setRequest(next);
      }),
    [],
  );

  const handleSettled = useCallback((ok: boolean) => {
    setRequest(null);
    resolverRef.current?.(ok);
    resolverRef.current = null;
  }, []);

  const exporter = request && (
    <Suspense>
      <ResumeExporter request={request} onSettled={handleSettled} />
    </Suspense>
  );

  return { runExport, exporting: request !== null, exporter };
}
