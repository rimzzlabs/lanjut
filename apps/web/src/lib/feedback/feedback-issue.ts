import { A, pipe, S } from "@mobily/ts-belt";
import type {
  BugFrequency,
  FeedbackArea,
  FeedbackDetails,
  FeedbackReport,
  IdeaImpact,
  WordingLanguage,
} from "./feedback-schema";

/**
 * How the issue reaches GitHub: filed by the Worker on the reporter's behalf,
 * or opened prefilled for the reporter to submit under their own account.
 */
export type FeedbackDelivery = "relay" | "github";

/** A GitHub issue, ready to file. The body and its headings are English. */
export interface FeedbackIssue {
  title: string;
  body: string;
  labels: string[];
}

const VIA_APP = "via app";

export const AREA_NAMES: Record<FeedbackArea, string> = {
  editor: "Editor",
  preview: "Preview",
  pdf: "PDF download",
  word: "Word download",
  "other-export": "Text, JSON, or YAML download",
  import: "Import",
  templates: "Templates",
  library: "Library and profiles",
  desktop: "Mac app",
  home: "Home page",
  other: "Other",
};

/** The triage label for an area, where one exists. */
const AREA_LABELS: Partial<Record<FeedbackArea, string>> = {
  editor: "area: editor",
  preview: "area: editor",
  pdf: "area: export",
  word: "area: export",
  "other-export": "area: export",
  import: "area: import",
  templates: "area: templates",
  desktop: "area: desktop",
};

const FREQUENCY_NAMES: Record<BugFrequency, string> = {
  always: "Every time",
  sometimes: "Sometimes",
  once: "Only once",
};

const IMPACT_NAMES: Record<IdeaImpact, string> = {
  nice: "Nice to have",
  time: "Saves time",
  blocker: "Cannot use Lanjut without it",
};

const LANGUAGE_NAMES: Record<WordingLanguage, string> = {
  en: "English",
  id: "Indonesian",
};

const DETAIL_ROWS: ReadonlyArray<[keyof FeedbackDetails, string]> = [
  ["app", "App"],
  ["platform", "Platform"],
  ["browser", "Browser"],
  ["os", "System"],
  ["language", "Language"],
  ["page", "Page"],
  ["template", "Template"],
  ["font", "Font"],
  ["documentLanguage", "Resume language"],
];

const TITLE_EXCERPT = 60;

/** Markdown characters in a name or table cell, made literal. */
function escapeInline(text: string): string {
  return pipe(
    text,
    S.replaceByRe(/[\\`*_[\]<>#|~]/g, "\\$&"),
    S.replaceByRe(/\s+/g, " "),
    S.trim,
  );
}

function section(heading: string, text: string): string {
  return `### ${heading}\n\n${S.trim(text)}`;
}

function quote(text: string): string {
  return pipe(
    S.split(S.trim(text), "\n"),
    A.map((line) => `> ${line}`),
    A.join("\n"),
  );
}

/** A quoted excerpt for a title, cut at a word when it is long. */
function excerpt(text: string): string {
  const line = pipe(text, S.replaceByRe(/\s+/g, " "), S.trim);
  if (S.length(line) <= TITLE_EXCERPT) return line;
  const cut = S.slice(line, 0, TITLE_EXCERPT);
  const lastSpace = cut.lastIndexOf(" ");
  return `${S.trimEnd(lastSpace > 20 ? S.slice(cut, 0, lastSpace) : cut)}…`;
}

function detailsBlock(details: FeedbackDetails | undefined): string {
  if (details === undefined) return "";
  const rows = pipe(
    DETAIL_ROWS,
    A.filterMap(([key, label]) => {
      const value = details[key];
      if (value === undefined || S.isEmpty(S.trim(value))) return undefined;
      return `| ${label} | ${escapeInline(value)} |`;
    }),
  );
  if (A.isEmpty(rows)) return "";
  return pipe(
    [
      "<details>",
      "<summary>Technical details</summary>",
      "",
      "| | |",
      "| --- | --- |",
      ...rows,
      "",
      "</details>",
    ],
    A.join("\n"),
  );
}

function footer(report: FeedbackReport, delivery: FeedbackDelivery): string {
  if (delivery === "github") {
    return "---\n\n_Written with the feedback form in the app._";
  }
  const name = S.trim(report.name);
  const by = S.isEmpty(name) ? "anonymously" : `by **${escapeInline(name)}**`;
  return `---\n\n_Sent ${by} from the feedback form in the app, and filed on their behalf._`;
}

function summaryLine(parts: ReadonlyArray<[string, string]>): string {
  return pipe(
    parts,
    A.map(([label, value]) => `**${label}:** ${value}`),
    A.join(" · "),
  );
}

function bodyOf(report: FeedbackReport): string {
  switch (report.kind) {
    case "bug":
      return pipe(
        [
          summaryLine([
            ["Area", AREA_NAMES[report.area]],
            ["Happens", FREQUENCY_NAMES[report.frequency]],
          ]),
          section("What I did", report.steps),
          section("What I expected", report.expected),
          section("What happened instead", report.actual),
        ],
        A.join("\n\n"),
      );
    case "idea":
      return pipe(
        [
          summaryLine([
            ["Area", AREA_NAMES[report.area]],
            ["How much it would help", IMPACT_NAMES[report.impact]],
          ]),
          section("What I am trying to do", report.goal),
          section("What would help", report.idea),
          S.isEmpty(S.trim(report.workaround))
            ? ""
            : section("How I manage today", report.workaround),
        ],
        A.filter(S.isNotEmpty),
        A.join("\n\n"),
      );
    case "wording":
      return pipe(
        [
          summaryLine([
            ["Where", AREA_NAMES[report.area]],
            ["Language", LANGUAGE_NAMES[report.language]],
          ]),
          `### The text now\n\n${quote(report.current)}`,
          S.isEmpty(S.trim(report.suggested))
            ? ""
            : `### Better wording\n\n${quote(report.suggested)}`,
          S.isEmpty(S.trim(report.note)) ? "" : section("Note", report.note),
        ],
        A.filter(S.isNotEmpty),
        A.join("\n\n"),
      );
  }
}

function titleOf(report: FeedbackReport): string {
  switch (report.kind) {
    case "bug":
      return `bug: ${S.trim(report.title)}`;
    case "idea":
      return `feat: ${S.trim(report.title)}`;
    case "wording":
      return `wording: "${excerpt(report.current)}"`;
  }
}

function labelsOf(report: FeedbackReport): string[] {
  const kindLabel: Record<FeedbackReport["kind"], string> = {
    bug: "bug",
    idea: "enhancement",
    wording: "area: translation",
  };
  const area = report.kind === "wording" ? undefined : AREA_LABELS[report.area];
  return pipe(
    [kindLabel[report.kind], VIA_APP, area ?? ""],
    A.filter(S.isNotEmpty),
    A.uniq,
    (labels) => [...labels],
  );
}

/**
 * The issue for a report: a plain prefixed title, the report in sections
 * with English headings, the technical details folded away, and who sent it.
 * The Worker files it, and the app shows it before sending and uses it for
 * the GitHub fallback, so the three never differ.
 */
export function buildFeedbackIssue(
  report: FeedbackReport,
  details: FeedbackDetails | undefined,
  delivery: FeedbackDelivery = "relay",
): FeedbackIssue {
  return {
    title: titleOf(report),
    labels: labelsOf(report),
    body: pipe(
      [bodyOf(report), detailsBlock(details), footer(report, delivery)],
      A.filter(S.isNotEmpty),
      A.join("\n\n"),
    ),
  };
}
