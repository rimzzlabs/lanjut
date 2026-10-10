import { A } from "@mobily/ts-belt";
import { TEMPLATES, type TemplateId } from "./templates";

const CREATOR_RE = /^Lanjut \(([a-z]+)\)$/;

function isTemplateId(value: string | undefined): value is TemplateId {
  return A.some(TEMPLATES, (template) => template.id === value);
}

/**
 * The creator Lanjut writes into every PDF it exports. It names the template
 * and nothing about the person, so an import of a Lanjut PDF knows its exact
 * layout.
 */
export function pdfCreator(template: TemplateId): string {
  return `Lanjut (${template})`;
}

/** The template that made a PDF, when Lanjut made it. */
export function templateOfCreator(
  creator: string | undefined,
): TemplateId | undefined {
  const name = CREATOR_RE.exec(creator ?? "")?.[1];
  return isTemplateId(name) ? name : undefined;
}
