import { R } from "@mobily/ts-belt";
import type { TemplateId } from "@/lib/templates";
import { safeFileName, triggerDownload } from "../download-file";
import type { ResumePreview } from "../resume-preview";
import { renderResumePdf } from "./render-resume-pdf";

interface DownloadResumeTakumiParams {
  preview: ResumePreview;
  fileName: string;
  template: TemplateId;
}

/**
 * Renders the résumé PDF from the preview's own HTML and downloads it. If the
 * renderer cannot run, for example when its WebAssembly fails to load, the
 * react-pdf export takes over so the download still succeeds.
 */
export async function downloadResumeTakumi(
  params: DownloadResumeTakumiParams,
): Promise<boolean> {
  const { preview, fileName, template } = params;
  const rendered = await renderResumePdf({ preview, template }).then(
    (bytes) => R.makeOk<Uint8Array, unknown>(bytes),
    (error: unknown) => R.makeError<Uint8Array, unknown>(error),
  );
  return R.match(
    rendered,
    (bytes) =>
      triggerDownload(
        new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
        `${safeFileName(fileName)}.pdf`,
      ),
    async (error) => {
      console.warn("takumi-pdf failed; exporting with react-pdf", error);
      const { downloadResumePdf } = await import("../pdf/download-resume-pdf");
      return downloadResumePdf(params);
    },
  );
}
