import type { TemplateId } from "@lanjut/resume/templates";
import { safeFileName, triggerDownload } from "../download-file";
import type { ResumePreview } from "../resume-preview";
import { renderResumePdf } from "./render-resume-pdf";

interface DownloadResumeTakumiParams {
  preview: ResumePreview;
  fileName: string;
  template: TemplateId;
}

/**
 * Renders the résumé PDF from the preview's own HTML and downloads it. Resolves
 * false when the renderer cannot run (for example, when its WebAssembly fails
 * to load), the same as a cancelled save.
 */
export async function downloadResumeTakumi(
  params: DownloadResumeTakumiParams,
): Promise<boolean> {
  const { preview, fileName, template } = params;
  const bytes = await renderResumePdf({ preview, template }).catch(
    (error: unknown) => {
      console.error("takumi-pdf could not render the résumé", error);
      return null;
    },
  );
  if (!bytes) return false;
  return triggerDownload(
    new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    `${safeFileName(fileName)}.pdf`,
  );
}
