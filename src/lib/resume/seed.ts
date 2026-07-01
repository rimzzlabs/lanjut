import { A, F, pipe } from "@mobily/ts-belt";
import type { JSONContent } from "@tiptap/core";
import type { Field, Resume } from "./types";
import { CURRENT_SCHEMA_VERSION } from "./types";

function plain(value: string): Field {
  return { kind: "plain", value };
}

function paragraph(text: string): JSONContent {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function bulletList(items: string[]): JSONContent {
  return {
    type: "bulletList",
    content: pipe(
      items,
      A.map((text) => ({ type: "listItem", content: [paragraph(text)] })),
      F.toMutable,
    ),
  };
}

function prose(...blocks: JSONContent[]): Field {
  return { kind: "richtext", value: { type: "doc", content: blocks } };
}

/**
 * The single code-defined sample Resume. Every newly created Resume is cloned
 * from this fixture, and the export Parser gate reuses it as its test document.
 * The stable ids here are placeholders — cloneResumeAsNew reassigns fresh ids.
 */
export const SEED_RESUME: Resume = {
  id: "seed",
  schemaVersion: CURRENT_SCHEMA_VERSION,
  title: "Untitled résumé",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  header: {
    fields: {
      fullName: plain("John Doe"),
      headline: plain("Senior Frontend Engineer"),
      email: plain("john.doe@example.com"),
      phone: plain("+1 555 010 1234"),
      location: plain("San Francisco, CA"),
      website: plain("https://johndoe.dev"),
    },
  },
  sections: [
    {
      id: "seed-summary",
      type: "summary",
      title: "Summary",
      entries: [
        {
          id: "seed-summary-1",
          fields: {
            body: prose(
              paragraph(
                "Frontend engineer with 8 years building accessible, performant web applications. Focused on design systems, developer experience, and shipping measurable outcomes.",
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-experience",
      type: "experience",
      title: "Experience",
      entries: [
        {
          id: "seed-experience-1",
          fields: {
            company: plain("Acme Corp"),
            role: plain("Senior Frontend Engineer"),
            location: plain("Remote"),
            startDate: plain("Mar 2022"),
            endDate: plain("Present"),
            highlights: prose(
              bulletList([
                "Led migration of a 200k-line codebase to a typed component library, cutting UI defects by 40%.",
                "Owned the design-system accessibility program, reaching WCAG 2.1 AA across all shipped components.",
                "Mentored four engineers and established the team's code-review and testing standards.",
              ]),
            ),
          },
        },
        {
          id: "seed-experience-2",
          fields: {
            company: plain("Globex"),
            role: plain("Frontend Engineer"),
            location: plain("Boston, MA"),
            startDate: plain("Jul 2018"),
            endDate: plain("Feb 2022"),
            highlights: prose(
              bulletList([
                "Built the customer-facing analytics dashboard used by 12k weekly active users.",
                "Reduced initial bundle size by 55% through code-splitting and dependency audits.",
              ]),
            ),
          },
        },
      ],
    },
    {
      id: "seed-education",
      type: "education",
      title: "Education",
      entries: [
        {
          id: "seed-education-1",
          fields: {
            institution: plain("State University"),
            degree: plain("B.Sc. Computer Science"),
            location: plain("Boston, MA"),
            startDate: plain("2014"),
            endDate: plain("2018"),
            details: prose(
              paragraph(
                "Graduated with honors. Coursework in HCI, distributed systems, and algorithms.",
              ),
            ),
          },
        },
      ],
    },
    {
      id: "seed-skills",
      type: "skills",
      title: "Skills",
      entries: [
        {
          id: "seed-skills-1",
          fields: {
            body: prose(
              bulletList([
                "Languages: TypeScript, JavaScript, HTML, CSS",
                "Frameworks: React, Next.js, Node.js",
                "Tooling: Vite, Playwright, Storybook, Figma",
              ]),
            ),
          },
        },
      ],
    },
  ],
};
