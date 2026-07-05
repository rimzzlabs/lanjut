import { buildResumeBlocks } from "./resume-blocks";
import type { ResumePreview } from "./resume-preview";
import { richBlocksToText } from "./rich-content";

function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

/** "Role - Company - Dates", dropping whichever parts are absent. */
function metaLine(...parts: string[]): string {
  return parts.filter(Boolean).join(" - ");
}

/**
 * Serializes the résumé to plain text in linear reading order, the ATS-safest
 * format. Reuses `buildResumeBlocks` so the content, ordering, sorting, and
 * empty-section gating match the preview and the PDF exactly.
 */
export function resumeToText(preview: ResumePreview): string {
  const lines: string[] = [];

  for (const block of buildResumeBlocks(preview)) {
    switch (block.kind) {
      case "header": {
        const { fullName, headline, contacts } = block.header;
        if (fullName) lines.push(fullName);
        if (headline) lines.push(headline);
        for (const contact of contacts) lines.push(contact.value);
        break;
      }
      case "heading":
        lines.push("", block.title.toUpperCase());
        break;
      case "summary":
        lines.push(...richBlocksToText(block.body));
        break;
      case "experience": {
        const { role, company, startDate, endDate, description } = block.item;
        lines.push(metaLine(role, company, dateRange(startDate, endDate)));
        lines.push(...richBlocksToText(description));
        lines.push("");
        break;
      }
      case "education": {
        const { degree, institution, startDate, endDate, details } = block.item;
        lines.push(
          metaLine(degree, institution, dateRange(startDate, endDate)),
        );
        lines.push(...richBlocksToText(details));
        lines.push("");
        break;
      }
      case "certificate": {
        const { title, issuer, startDate, endDate } = block.item;
        lines.push(metaLine(title, issuer, dateRange(startDate, endDate)));
        break;
      }
      case "skills":
      case "languages":
        for (const item of block.items) {
          lines.push(metaLine(item.name, item.proficiency));
        }
        break;
    }
  }

  // Collapse runs of blank lines and normalize to a single trailing newline.
  return `${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
}
