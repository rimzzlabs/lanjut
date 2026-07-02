import { Packer } from "docx";
import { safeFileName, triggerDownload } from "../download-file";
import type { ResumePreview } from "../resume-preview";
import { buildAwalDocx } from "./resume-to-docx";

/**
 * Builds the .docx entirely in the browser and downloads it as `<fileName>.docx`.
 * No résumé content leaves the device. Loaded lazily by the download button so
 * the docx library stays out of the main bundle.
 */
export async function downloadResumeDocx(
  preview: ResumePreview,
  fileName: string,
): Promise<void> {
  const blob = await Packer.toBlob(buildAwalDocx(preview));
  triggerDownload(blob, `${safeFileName(fileName)}.docx`);
}
