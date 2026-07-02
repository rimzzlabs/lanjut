import { pdf } from "@react-pdf/renderer";
import type { ResumePreview } from "../resume-preview";
import { registerAwalFonts } from "./awal-fonts";
import { AwalPdfDocument } from "./awal-pdf-document";

/** Slugifies a résumé title into a safe file stem, falling back to "resume". */
function fileStem(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "resume";
}

/**
 * Generates the Awal PDF for `preview` entirely in the browser and triggers a
 * download. No résumé content leaves the device — react-pdf renders to a Blob
 * client-side. Loaded lazily by the download button so react-pdf stays out of
 * the main bundle.
 */
export async function downloadResumePdf(
  preview: ResumePreview,
  title: string,
): Promise<void> {
  registerAwalFonts();
  const blob = await pdf(<AwalPdfDocument preview={preview} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileStem(title)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
