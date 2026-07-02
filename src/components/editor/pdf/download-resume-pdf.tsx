import { pdf } from "@react-pdf/renderer";
import type { ResumePreview } from "../resume-preview";
import { registerAwalFonts } from "./awal-fonts";
import { AwalPdfDocument } from "./awal-pdf-document";

/**
 * Sanitizes a user-typed file name: strips characters illegal in file names and
 * a redundant trailing ".pdf", preserving spaces and case. Falls back to
 * "resume" when nothing usable remains.
 */
function safeFileName(name: string): string {
  const cleaned = name
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .trim();
  return cleaned || "resume";
}

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
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(fileName)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
