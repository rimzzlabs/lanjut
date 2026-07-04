import type { JSONContent } from "@tiptap/core";
import type { Field, Resume } from "./types";
import { CURRENT_SCHEMA_VERSION } from "./types";

function plain(value: string): Field {
  return { kind: "plain", value };
}

function t(text: string): JSONContent {
  return { type: "text", text };
}

function b(text: string): JSONContent {
  return { type: "text", text, marks: [{ type: "bold" }] };
}

function i(text: string): JSONContent {
  return { type: "text", text, marks: [{ type: "italic" }] };
}

function link(text: string, href: string): JSONContent {
  return { type: "text", text, marks: [{ type: "link", attrs: { href } }] };
}

function p(...runs: JSONContent[]): JSONContent {
  return { type: "paragraph", content: runs };
}

function li(...runs: JSONContent[]): JSONContent {
  return { type: "listItem", content: [p(...runs)] };
}

function ul(...items: JSONContent[]): JSONContent {
  return { type: "bulletList", content: items };
}

function prose(...blocks: JSONContent[]): Field {
  return { kind: "richtext", value: { type: "doc", content: blocks } };
}

/**
 * The single code-defined sample Resume. Every newly created Resume is cloned
 * from this fixture, and the export Parser gate reuses it as its test document.
 * The stable ids here are placeholders — cloneResumeAsNew reassigns fresh ids.
 * It doubles as the "Awal" template showcase, so it exercises every section plus
 * bold / italic / link marks.
 */
export const SEED_RESUME: Resume = {
  id: "seed",
  schemaVersion: CURRENT_SCHEMA_VERSION,
  title: "Untitled résumé",
  templateId: "awal",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  header: {
    fields: {
      firstName: plain("John"),
      lastName: plain("Doe"),
      jobTitle: plain("Senior Frontend Engineer"),
      email: plain("john.doe@example.com"),
      phone: plain("+15550101234"),
      website: plain("johndoe.dev"),
      city: plain("San Francisco"),
      province: plain("California"),
      country: plain("United States"),
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
              p(
                t("Senior frontend engineer with "),
                b("8+ years"),
                t(
                  " building accessible, high-performance web applications for fintech and SaaS. Deep experience with ",
                ),
                b("React"),
                t(", "),
                b("Next.js"),
                t(", and design systems, with a focus on "),
                i("developer experience"),
                t(
                  " and shipping measurable outcomes. Comfortable leading projects end to end and mentoring teams.",
                ),
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
            title: plain("Senior Frontend Engineer"),
            company: plain("Acme Corp"),
            website: plain("acme.example.com"),
            startDate: plain("Mar 2022"),
            endDate: plain("Present"),
            description: prose(
              ul(
                li(
                  t(
                    "Led migration of a 200k-line codebase to a typed component library, cutting UI defects by ",
                  ),
                  b("40%"),
                  t("."),
                ),
                li(
                  t(
                    "Architected the design-system accessibility program, reaching ",
                  ),
                  b("WCAG 2.1 AA"),
                  t(" across every shipped component."),
                ),
                li(
                  t("Cut initial bundle size "),
                  b("55%"),
                  t(
                    " with code-splitting and dependency audits, improving LCP from 3.1s to ",
                  ),
                  b("1.4s"),
                  t("."),
                ),
                li(
                  t(
                    "Built a real-time analytics dashboard over WebSockets, adopted by ",
                  ),
                  b("12k weekly"),
                  t(" active users."),
                ),
                li(
                  t("Maintain "),
                  link(
                    "react-a11y-kit",
                    "https://github.com/johndoe/react-a11y-kit",
                  ),
                  t(", an open-source accessibility toolkit with "),
                  b("2k+ stars"),
                  t("."),
                ),
                li(
                  t(
                    "Mentored four engineers and set the team's code-review, testing, and release standards.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-experience-2",
          fields: {
            title: plain("Frontend Engineer"),
            company: plain("Globex"),
            website: plain("globex.example.com"),
            startDate: plain("Jul 2018"),
            endDate: plain("Feb 2022"),
            description: prose(
              ul(
                li(
                  t(
                    "Delivered the customer-facing analytics dashboard used by ",
                  ),
                  b("12k"),
                  t(" weekly active users."),
                ),
                li(
                  t(
                    "Introduced a shared component library and Storybook, cutting feature delivery time by ~",
                  ),
                  b("30%"),
                  t("."),
                ),
                li(
                  t(
                    "Integrated analytics and A/B testing (Mixpanel, GrowthBook) to drive data-informed UI decisions.",
                  ),
                ),
                li(
                  t("Moved all marketing sites to "),
                  b("Good"),
                  t(
                    " Core Web Vitals through image, font, and caching optimizations.",
                  ),
                ),
              ),
            ),
          },
        },
        {
          id: "seed-experience-3",
          fields: {
            title: plain("Junior Frontend Developer"),
            company: plain("Initech"),
            website: plain("initech.example.com"),
            startDate: plain("Aug 2016"),
            endDate: plain("Jun 2018"),
            description: prose(
              ul(
                li(
                  t(
                    "Built responsive, cross-browser interfaces from Figma designs for enterprise clients.",
                  ),
                ),
                li(
                  t(
                    "Automated form-heavy QA workflows, reducing manual testing time by ",
                  ),
                  b("20%"),
                  t("."),
                ),
                li(
                  t(
                    "Shipped a reusable form-validation library still used across three internal apps.",
                  ),
                ),
              ),
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
              p(
                t(
                  "Graduated with honors (GPA 3.8). Coursework in HCI, distributed systems, and algorithms; led the campus Web Development Club.",
                ),
              ),
            ),
          },
        },
        {
          id: "seed-education-2",
          fields: {
            institution: plain("Recurse Center"),
            degree: plain("Software Residency"),
            location: plain("New York, NY"),
            startDate: plain("2019"),
            endDate: plain("2019"),
            details: prose(
              p(
                t(
                  "A self-directed residency focused on systems programming, compilers, and open-source contribution.",
                ),
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
          fields: { name: plain("TypeScript"), level: plain("Expert") },
        },
        {
          id: "seed-skills-2",
          fields: {
            name: plain("JavaScript (ES2023)"),
            level: plain("Expert"),
          },
        },
        {
          id: "seed-skills-3",
          fields: { name: plain("React & Next.js"), level: plain("Expert") },
        },
        {
          id: "seed-skills-4",
          fields: { name: plain("Node.js"), level: plain("Advanced") },
        },
        {
          id: "seed-skills-5",
          fields: {
            name: plain("GraphQL & REST APIs"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-6",
          fields: { name: plain("Tailwind CSS"), level: plain("Advanced") },
        },
        {
          id: "seed-skills-7",
          fields: {
            name: plain("Testing (Playwright, Vitest)"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-8",
          fields: {
            name: plain("State (Zustand, React Query)"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-9",
          fields: {
            name: plain("Web Accessibility (WCAG)"),
            level: plain("Advanced"),
          },
        },
        {
          id: "seed-skills-10",
          fields: {
            name: plain("CI/CD & Docker"),
            level: plain("Intermediate"),
          },
        },
      ],
    },
    {
      id: "seed-certifications",
      type: "certifications",
      title: "Certifications",
      entries: [
        {
          id: "seed-certifications-1",
          fields: {
            name: plain("AWS Certified Solutions Architect – Associate"),
            issuer: plain("Amazon Web Services"),
            url: plain("aws.amazon.com/verification"),
          },
        },
        {
          id: "seed-certifications-2",
          fields: {
            name: plain("Meta Front-End Developer"),
            issuer: plain("Coursera"),
            url: plain("coursera.org/verify/meta-frontend"),
          },
        },
        {
          id: "seed-certifications-3",
          fields: {
            name: plain("Certified Professional in Web Accessibility (CPACC)"),
            issuer: plain("IAAP"),
            url: plain("accessibilityassociation.org"),
          },
        },
      ],
    },
    {
      id: "seed-languages",
      type: "languages",
      title: "Languages",
      entries: [
        {
          id: "seed-languages-1",
          fields: { name: plain("English"), level: plain("Native") },
        },
        {
          id: "seed-languages-2",
          fields: { name: plain("Spanish"), level: plain("Professional") },
        },
        {
          id: "seed-languages-3",
          fields: { name: plain("French"), level: plain("Conversational") },
        },
      ],
    },
  ],
};
