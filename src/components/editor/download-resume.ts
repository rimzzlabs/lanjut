import type { Resume } from "@/lib/resume";
import { resolveTemplateId } from "@/lib/templates";
import { resumeToPreview } from "./resume-to-preview";

export type ExportFormat = "pdf" | "docx" | "txt";

export const EXPORT_FORMATS: ExportFormat[] = ["pdf", "docx", "txt"];

/**
 * Exports `resume` in the chosen format and triggers the browser download.
 * Everything renders client-side; no résumé content leaves the device. The
 * per-format modules are loaded lazily so the heavy PDF/docx libraries stay
 * out of the main bundle.
 */
export async function downloadResume(
  resume: Resume,
  format: ExportFormat,
  fileName: string,
): Promise<void> {
  const preview = resumeToPreview(resume);

  if (format === "pdf") {
    const { downloadResumePdf } = await import("./pdf/download-resume-pdf");
    await downloadResumePdf(
      preview,
      fileName,
      resolveTemplateId(resume.templateId),
    );
    return;
  }

  if (format === "docx") {
    const { downloadResumeDocx } = await import("./docx/download-resume-docx");
    await downloadResumeDocx(preview, fileName);
    return;
  }

  const { downloadResumeText } = await import("./download-resume-text");
  downloadResumeText(preview, fileName);
}
