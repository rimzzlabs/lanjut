import type { ResumePreview } from "./resume-preview";

/**
 * Static stand-in for the output of the (not-yet-written) `Resume → ResumePreview`
 * adapter. Mirrors `resume-rimzzlabs.pdf` so the presentation layer can be built
 * and reviewed against a real document before the data flow is wired up.
 */
export const RESUME_PREVIEW_FIXTURE: ResumePreview = {
  header: {
    fullName: "Rizki Citra",
    headline: "Frontend Engineer",
    contacts: [
      { kind: "phone", value: "+62 89654983166", href: "tel:+6289654983166" },
      {
        kind: "email",
        value: "hello@rimzzlabs.com",
        href: "mailto:hello@rimzzlabs.com",
      },
      {
        kind: "website",
        value: "rimzzlabs.com",
        href: "https://rimzzlabs.com",
      },
      { kind: "location", value: "Serang City, Indonesia" },
    ],
  },
  summary:
    "Frontend Engineer with 4 years building production applications for fintech; including cryptocurrency platforms. Specialized in React and Next.js with proven experience delivering real-time trading interfaces, WebSocket integrations, and high-performance web applications. Track record of improving application performance and collaborating across product, design, and backend teams in fast-paced environments.",
  experience: [
    {
      id: "exp-bitwyre",
      role: "Frontend Engineer",
      company: "Bitwyre",
      companyHref: "https://bitwyre.com",
      startDate: "02/2024",
      endDate: "10/2025",
      highlights: [
        "Architected and built the frontend for a cryptocurrency exchange platform using Next.js and TypeScript, implementing real-time price feeds via WebSocket integration for multiple trading pairs",
        "Developed an institutional OTC trading platform with secure transaction flows, role-based access controls, and compliance features for enterprise clients",
        "Improved application performance through code splitting, lazy loading, and React Query optimization, significantly reducing bundle size and initial load times",
        "Built cross-platform mobile features for Bitwyre's crypto card product using React Native, extending core functionality to iOS and Android platforms",
        "Designed and implemented comprehensive error handling for WebSocket connections, ensuring reliable real-time data delivery even during network disruptions",
        "Collaborated with backend engineers on API design, reducing unnecessary data transfers and improving overall platform responsiveness",
        "Managed deployment pipeline using Docker and Jenkins, working with DevOps team to containerize applications and automate CI/CD workflows for staging and production environments",
      ],
    },
    {
      id: "exp-skyshi",
      role: "Frontend Developer",
      company: "Skyshi Digital",
      companyHref: "https://skyshi.com",
      startDate: "12/2021",
      endDate: "02/2024",
      highlights: [
        "Delivered client projects using Next.js and React, including e-commerce platforms, marketing sites, and corporate websites in a fast-paced agency environment",
        "Built and maintained a scalable component library and design system used across multiple client projects, reducing development time and ensuring brand consistency",
        "Optimized website performance across client sites by implementing code splitting, image optimization, and caching strategies, improving Core Web Vitals scores",
        "Integrated analytics pipelines (Google Analytics, Mixpanel) and implemented A/B testing frameworks to enable data-driven design decisions for marketing campaigns",
        "Led mobile-first development approach for all projects, ensuring responsive experiences across devices and browsers with cross-browser compatibility testing",
        "Collaborated with designers and backend teams to translate Figma designs into production-ready components, establishing clear handoff processes and documentation",
        "Built an internal ticketing system using Angular, implementing features for issue tracking, assignment workflows, and status management",
        "Developed a dynamic form builder with drag-and-drop functionality, supporting multiple field types, conditional logic, and real-time preview capabilities",
      ],
    },
  ],
  education: [
    {
      id: "edu-amik",
      degree: "Informatics Management",
      institution: "AMIK Serang - Associate's Degree",
      startDate: "12/2021",
      endDate: "12/2024",
    },
  ],
  certificates: [
    {
      id: "cert-efset",
      title: "English Certificate (C1 Advanced)",
      issuer: "EF SET",
      href: "https://www.efset.org",
      startDate: "11/2024",
      endDate: "Present",
    },
    {
      id: "cert-hackerrank",
      title: "Frontend Developer (React)",
      issuer: "Hackerrank",
      href: "https://www.hackerrank.com",
      startDate: "01/2024",
      endDate: "Present",
    },
  ],
  skills: [
    "Next.js, React Router / Remix, Astro.js",
    "React.js, React Native",
    "Tanstack (Query, Table, Virtual)",
    "Jotai, Zustand, Redux, Recoil",
    "Jest, Vitest, Testing Library",
    "Vue.js, Svelte.js",
    "WebSocket, Socket.io, REST APIs",
    "Node.js, Prisma, Drizzle",
    "TypeScript, JavaScript / ES6+",
    "CSS, CSS3, SCSS, Tailwind CSS, ShadCN",
    "Figma, Git, GitHub, GitLab, Docker",
    "Search Engine Optimization",
    "Responsive Design",
    "User Experience & Web Accessibility",
  ],
  languages: [
    { id: "lang-id", name: "Indonesian", proficiency: "Native" },
    { id: "lang-en", name: "English", proficiency: "Fluent" },
  ],
};
