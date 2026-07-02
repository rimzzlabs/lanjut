import { safeFileName, triggerDownload } from "./download-file";
import type { ResumePreview } from "./resume-preview";
import { resumeToText } from "./resume-to-text";

/** Serializes `preview` to plain text and downloads it as `<fileName>.txt`. */
export function downloadResumeText(
  preview: ResumePreview,
  fileName: string,
): void {
  const blob = new Blob([resumeToText(preview)], {
    type: "text/plain;charset=utf-8",
  });
  triggerDownload(blob, `${safeFileName(fileName)}.txt`);
}
