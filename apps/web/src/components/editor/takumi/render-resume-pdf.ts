import type { TemplateId } from "@lanjut/resume/templates";
import { F } from "@mobily/ts-belt";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PdfRenderer } from "takumi-pdf";
import { A4 } from "../resume-geometry";
import type { ResumePreview } from "../resume-preview";
import { RESUME_PDF_CSS } from "./takumi-css";
import {
  fetchFontFile,
  type ReadFontFile,
  resumeFontLoaders,
} from "./takumi-fonts";
import { TakumiResumeFlow } from "./takumi-resume-flow";

let sharedRenderer: PdfRenderer | null = null;

// One renderer for the session: it keeps registered fonts between exports.
function renderer(): PdfRenderer {
  sharedRenderer ??= new PdfRenderer();
  return sharedRenderer;
}

interface RenderResumePdfParams {
  preview: ResumePreview;
  template: TemplateId;
  readFile?: ReadFontFile;
}

/**
 * Renders the résumé to PDF bytes from the same HTML and CSS as the preview.
 * Runs in the browser; no résumé content leaves the device.
 */
export function renderResumePdf(
  params: RenderResumePdfParams,
): Promise<Uint8Array> {
  const { preview, template, readFile = fetchFontFile } = params;
  const html = renderToStaticMarkup(
    createElement(TakumiResumeFlow, { preview, template }),
  );
  return renderer().render(html, {
    size: "a4",
    margin: A4.marginPx,
    css: RESUME_PDF_CSS,
    // takumi-pdf takes a mutable font list.
    fonts: F.toMutable(
      resumeFontLoaders({ fontId: preview.font ?? undefined, readFile }),
    ),
    lang: preview.language,
    // A character no font covers shows as a box, as in the preview, rather
    // than failing the whole export.
    uncoveredText: "placeholder",
  });
}
