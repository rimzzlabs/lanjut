import { pdf } from "@react-pdf/renderer";
import { safeFileName, triggerDownload } from "../download-file";
import type { ResumePreview } from "../resume-preview";
import { registerAwalFonts } from "./awal-fonts";
import { AwalPdfDocument } from "./awal-pdf-document";

/**
 * Generates the Awal PDF for `preview` entirely in the browser and triggers a
 * download as `<fileName>.pdf`. No résumé content leaves the device — react-pdf
 * renders to a Blob client-side. Loaded lazily by the download button so
 * react-pdf stays out of the main bundle.
 */
export async function downloadResumePdf(
  preview: ResumePreview,
  fileName: string,
): Promise<void> {
  registerAwalFonts();
  const blob = await pdf(<AwalPdfDocument preview={preview} />).toBlob();
  triggerDownload(blob, `${safeFileName(fileName)}.pdf`);
}
