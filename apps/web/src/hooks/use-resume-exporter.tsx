import { useCallback, useState } from "react";
import type { ResumeExportRequest } from "@/components/editor/download-resume";

/**
 * Runs an export and reports whether a file was saved. The download module is
 * loaded on first use, so the PDF and DOCX libraries stay out of the page
 * bundle until someone exports.
 */
export function useResumeExporter() {
  const [exporting, setExporting] = useState(false);

  const runExport = useCallback(async (request: ResumeExportRequest) => {
    setExporting(true);
    try {
      const { downloadResume } = await import(
        "@/components/editor/download-resume"
      );
      return await downloadResume(request);
    } catch {
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return { runExport, exporting };
}
