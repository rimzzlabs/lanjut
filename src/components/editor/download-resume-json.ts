import { resumeToJson } from "@/lib/interchange";
import type { Resume } from "@/lib/resume";
import { safeFileName, triggerDownload } from "./download-file";

/**
 * Serializes the full document (not the preview projection) to interchange
 * JSON and downloads it as `<fileName>.json`, so the file re-imports losslessly.
 */
export async function downloadResumeJson(
  resume: Resume,
  fileName: string,
): Promise<boolean> {
  const blob = new Blob([resumeToJson(resume)], {
    type: "application/json;charset=utf-8",
  });
  return triggerDownload(blob, `${safeFileName(fileName)}.json`);
}
