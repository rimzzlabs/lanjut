import type { Resume } from "@lanjut/resume";
import { getResume } from "@lanjut/resume/db";
import { resolveTemplateId } from "@lanjut/resume/templates";

/**
 * Loads the PDF renderer and the fonts a résumé draws with before the
 * download click, so the first PDF export only renders. A failure here is
 * left for the export itself to report.
 */
export function preloadPdfExport(
  resume: Pick<Resume, "templateId" | "font">,
): void {
  void import("./takumi/render-resume-pdf")
    .then((pdf) =>
      pdf.warmUpResumePdf({
        template: resolveTemplateId(resume.templateId),
        fontId: resume.font,
      }),
    )
    .catch(() => undefined);
}

/** `preloadPdfExport` for a stored résumé, read by its id. */
export function preloadPdfExportById(id: string): void {
  void getResume(id)
    .then((resume) => {
      if (resume) preloadPdfExport(resume);
    })
    .catch(() => undefined);
}
