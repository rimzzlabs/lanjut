/** Canonical site identity, shared by metadata, Open Graph, robots, and the sitemap. */
export const SITE = {
  name: "Lanjut",
  url: "https://lanjut.rimzzlabs.com",
  title: "Lanjut: Free, local-first ATS resume builder",
  description:
    "Lanjut is a free, open-source resume builder that stays entirely in your browser; no account, nothing uploaded. Style it freely; every export is structured to sail through applicant tracking systems.",
} as const;

/** Donation profiles, shared by the landing footer and the platform sidebar. */
export const DONATION_LINKS = {
  saweria: "https://saweria.co/rimzzlabs",
  sociabuzz: "https://sociabuzz.com/rimzzlabs/tribe",
} as const;
