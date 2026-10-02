import { pdf } from "@react-pdf/renderer";
import type { TemplateId } from "@/lib/templates";
import { safeFileName, triggerDownload } from "../download-file";
import type { ResumePreview } from "../resume-preview";
import { registerPdfFonts } from "./pdf-fonts";
import { TEMPLATE_PDF_DOCUMENTS } from "./template-pdf-document";

interface DownloadResumePdfParams {
  preview: ResumePreview;
  fileName: string;
  template: TemplateId;
}

/**
 * Generates the résumé's template as a PDF entirely in the browser and triggers
 * a download as `<fileName>.pdf`. No résumé content leaves the device;
 * react-pdf renders to a Blob client-side. Loaded lazily by the download button
 * so react-pdf stays out of the main bundle.
 */
export async function downloadResumePdf(
  params: DownloadResumePdfParams,
): Promise<boolean> {
  const { preview, fileName, template } = params;
  registerPdfFonts();
  const PdfDocument = TEMPLATE_PDF_DOCUMENTS[template];
  const blob = await pdf(<PdfDocument preview={preview} />).toBlob();
  return triggerDownload(blob, `${safeFileName(fileName)}.pdf`);
}
