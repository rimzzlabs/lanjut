import { A, G, pipe, S } from "@mobily/ts-belt";
import { richBlocksToText } from "@/lib/resume/rich-content";
import { joinPresent } from "@/lib/utils";
import { buildResumeBlocks, type ResumeBlock } from "./resume-blocks";
import { withLocation } from "./resume-entry-location";
import type { ResumePreview } from "./resume-preview";

function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

/** "Role - Company - Dates", dropping whichever parts are absent. */
function metaLine(...parts: string[]): string {
  return joinPresent(parts, " - ");
}

function presentLines(
  values: ReadonlyArray<string | undefined>,
): ReadonlyArray<string> {
  return pipe(values, A.filter(G.isString), A.reject(S.isEmpty));
}

function blockLines(block: ResumeBlock): ReadonlyArray<string> {
  switch (block.kind) {
    case "header": {
      const { fullName, headline, contacts } = block.header;
      return [
        ...presentLines([fullName, headline]),
        ...A.map(contacts, (contact) => contact.value),
      ];
    }
    case "heading":
      return ["", S.toUpperCase(block.title)];
    case "summary":
      return richBlocksToText(block.body);
    case "experience": {
      const {
        role,
        company,
        location,
        companyContext,
        startDate,
        endDate,
        description,
      } = block.item;
      return [
        metaLine(
          role,
          withLocation(company, location),
          dateRange(startDate, endDate),
        ),
        ...presentLines([companyContext]),
        ...richBlocksToText(description),
        "",
      ];
    }
    case "education": {
      const { degree, institution, location, startDate, endDate, details } =
        block.item;
      return [
        metaLine(
          degree,
          withLocation(institution, location),
          dateRange(startDate, endDate),
        ),
        ...richBlocksToText(details),
        "",
      ];
    }
    case "certificate": {
      const { title, issuer, startDate, endDate } = block.item;
      return [metaLine(title, issuer, dateRange(startDate, endDate))];
    }
    case "skills":
    case "languages":
      return A.map(block.items, (item) =>
        metaLine(item.name, item.proficiency),
      );
  }
}

/**
 * Serializes the résumé to plain text in linear reading order, the ATS-safest
 * format. Reuses `buildResumeBlocks` so the content, ordering, sorting, and
 * empty-section gating match the preview and the PDF exactly.
 */
export function resumeToText(preview: ResumePreview): string {
  // Collapse runs of blank lines and normalize to a single trailing newline.
  return `${pipe(
    buildResumeBlocks(preview),
    A.flatMap(blockLines),
    A.join("\n"),
    S.replaceByRe(/\n{3,}/g, "\n\n"),
    S.trim,
  )}\n`;
}
