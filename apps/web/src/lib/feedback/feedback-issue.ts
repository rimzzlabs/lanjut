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

/** A short fact of a report or of its technical details. */
export interface FeedbackFact {
  label: string;
  value: string;
}

/** One answer of a report: its English heading and the reporter's text. */
export interface FeedbackAnswer {
  heading: string;
  text: string;
  /** The text quotes the app's copy, so it shows as a quotation. */
  quoted?: boolean;
}

export interface FeedbackOutline {
  facts: ReadonlyArray<FeedbackFact>;
  answers: ReadonlyArray<FeedbackAnswer>;
  details: ReadonlyArray<FeedbackFact>;
  /** The reporter's name, empty for an anonymous report. */
  sender: string;
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
  desktop: "Desktop app",
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

function detailRows(
  details: FeedbackDetails | undefined,
): ReadonlyArray<FeedbackFact> {
  if (details === undefined) return [];
  return A.filterMap(DETAIL_ROWS, (row) => {
    const [key, label] = row;
    const value = details[key];
    if (value === undefined || S.isEmpty(S.trim(value))) return undefined;
    return { label, value: S.trim(value) };
  });
}

function detailsBlock(details: ReadonlyArray<FeedbackFact>): string {
  if (A.isEmpty(details)) return "";
  return pipe(
    [
      "<details>",
      "<summary>Technical details</summary>",
      "",
      "| | |",
      "| --- | --- |",
      ...A.map(
        details,
        (row) => `| ${row.label} | ${escapeInline(row.value)} |`,
      ),
      "",
      "</details>",
    ],
    A.join("\n"),
  );
}

function footer(sender: string, delivery: FeedbackDelivery): string {
  if (delivery === "github") {
    return "---\n\n_Written with the feedback form in the app._";
  }
  const by = S.isEmpty(sender)
    ? "anonymously"
    : `by **${escapeInline(sender)}**`;
  return `---\n\n_Sent ${by} from the feedback form in the app, and filed on their behalf._`;
}

function summaryLine(facts: ReadonlyArray<FeedbackFact>): string {
  return pipe(
    facts,
    A.map((fact) => `**${fact.label}:** ${fact.value}`),
    A.join(" · "),
  );
}

function answerBlock(answer: FeedbackAnswer): string {
  if (answer.quoted) return `### ${answer.heading}\n\n${quote(answer.text)}`;
  return section(answer.heading, answer.text);
}

function factsOf(report: FeedbackReport): ReadonlyArray<FeedbackFact> {
  switch (report.kind) {
    case "bug":
      return [
        { label: "Area", value: AREA_NAMES[report.area] },
        { label: "Happens", value: FREQUENCY_NAMES[report.frequency] },
      ];
    case "idea":
      return [
        { label: "Area", value: AREA_NAMES[report.area] },
        {
          label: "How much it would help",
          value: IMPACT_NAMES[report.impact],
        },
      ];
    case "wording":
      return [
        { label: "Where", value: AREA_NAMES[report.area] },
        { label: "Language", value: LANGUAGE_NAMES[report.language] },
      ];
  }
}

function answersOf(report: FeedbackReport): ReadonlyArray<FeedbackAnswer> {
  switch (report.kind) {
    case "bug":
      return [
        { heading: "What I did", text: report.steps },
        { heading: "What I expected", text: report.expected },
        { heading: "What happened instead", text: report.actual },
      ];
    case "idea":
      return [
        { heading: "What I am trying to do", text: report.goal },
        { heading: "What would help", text: report.idea },
        { heading: "How I manage today", text: report.workaround },
      ];
    case "wording":
      return [
        { heading: "The text now", text: report.current, quoted: true },
        { heading: "Better wording", text: report.suggested, quoted: true },
        { heading: "Note", text: report.note },
      ];
  }
}

/**
 * The report in parts, before any Markdown. The issue body and the email to
 * the maintainer both come from it. An answer left empty is not in it.
 */
export function buildFeedbackOutline(
  report: FeedbackReport,
  details: FeedbackDetails | undefined,
): FeedbackOutline {
  return {
    facts: factsOf(report),
    answers: pipe(
      answersOf(report),
      A.map((answer) => ({ ...answer, text: S.trim(answer.text) })),
      A.filter((answer) => S.isNotEmpty(answer.text)),
    ),
    details: detailRows(details),
    sender: S.trim(report.name),
  };
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
  const outline = buildFeedbackOutline(report, details);
  return {
    title: titleOf(report),
    labels: labelsOf(report),
    body: pipe(
      [
        summaryLine(outline.facts),
        ...A.map(outline.answers, answerBlock),
        detailsBlock(outline.details),
        footer(outline.sender, delivery),
      ],
      A.filter(S.isNotEmpty),
      A.join("\n\n"),
    ),
  };
}
