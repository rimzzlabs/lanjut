import type { Resume } from "@/lib/resume";
import { resolveTemplateId } from "@/lib/templates";
import type { ExportFormat } from "./export-format";
import { resumeToPreview } from "./resume-to-preview";

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
): Promise<boolean> {
  if (format === "json") {
    const { downloadResumeJson } = await import("./download-resume-json");
    return downloadResumeJson(resume, fileName);
  }

  if (format === "yaml") {
    const { downloadResumeYaml } = await import("./download-resume-yaml");
    return downloadResumeYaml(resume, fileName);
  }

  const preview = resumeToPreview(resume);

  if (format === "pdf") {
    const { downloadResumePdf } = await import("./pdf/download-resume-pdf");
    return downloadResumePdf(
      preview,
      fileName,
      resolveTemplateId(resume.templateId),
    );
  }

  if (format === "docx") {
    const { downloadResumeDocx } = await import("./docx/download-resume-docx");
    return downloadResumeDocx(preview, fileName);
  }

  const { downloadResumeText } = await import("./download-resume-text");
  return downloadResumeText(preview, fileName);
}
