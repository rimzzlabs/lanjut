import { resumeToYaml } from "@/lib/interchange";
import type { Resume } from "@/lib/resume";
import { safeFileName, triggerDownload } from "./download-file";

/**
 * Serializes the full document (not the preview projection) to interchange
 * YAML and downloads it as `<fileName>.yaml`, so the file re-imports losslessly.
 */
export async function downloadResumeYaml(
  resume: Resume,
  fileName: string,
): Promise<boolean> {
  const blob = new Blob([resumeToYaml(resume)], {
    type: "text/yaml;charset=utf-8",
  });
  return triggerDownload(blob, `${safeFileName(fileName)}.yaml`);
}
