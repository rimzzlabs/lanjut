import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import type { ResumeExportRequest } from "@/components/editor/download-resume";
import { IS_DESKTOP } from "@/lib/build-target";

async function exportResume(request: ResumeExportRequest): Promise<boolean> {
  try {
    const { downloadResume } = await import(
      "@/components/editor/download-resume"
    );
    return await downloadResume(request);
  } catch {
    return false;
  }
}

/**
 * Runs an export and reports whether a file was saved. The download module is
 * loaded on first use, so the PDF and DOCX libraries stay out of the page
 * bundle until someone exports.
 */
export function useResumeExporter() {
  const [exporting, setExporting] = useState(false);
  const t = useTranslations("forms.download");

  const runExport = useCallback(
    async (request: ResumeExportRequest) => {
      setExporting(true);
      const saved = await exportResume(request);
      setExporting(false);
      // On the web a save cannot be cancelled, so a failure with no network
      // means a file the export needs is not on this device yet.
      if (!saved && !IS_DESKTOP && !navigator.onLine) {
        toast.error(t("offlineTitle"), {
          description: t("offlineDescription"),
        });
      }
      return saved;
    },
    [t],
  );

  return { runExport, exporting };
}
