import type { ComponentType } from "react";
import type { TemplateId } from "@/lib/templates";
import type { ResumePreview } from "../resume-preview";
import { AwalPdfDocument } from "./awal-pdf-document";
import { KetatPdfDocument } from "./ketat-pdf-document";
import { KetikPdfDocument } from "./ketik-pdf-document";
import { KlasikPdfDocument } from "./klasik-pdf-document";
import { LuasaPdfDocument } from "./luasa-pdf-document";
import { TebalPdfDocument } from "./tebal-pdf-document";

export type PdfDocumentComponent = ComponentType<{ preview: ResumePreview }>;

/**
 * PDF counterpart of the preview's block-view registry: which react-pdf
 * document renders each template, keeping the download WYSIWYG with the
 * on-screen preview. All documents share the same linear block model.
 */
export const TEMPLATE_PDF_DOCUMENTS: Record<TemplateId, PdfDocumentComponent> =
  {
    awal: AwalPdfDocument,
    ketat: KetatPdfDocument,
    luasa: LuasaPdfDocument,
    tebal: TebalPdfDocument,
    klasik: KlasikPdfDocument,
    ketik: KetikPdfDocument,
  };
